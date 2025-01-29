import {
    Octokit
} from "https://esm.sh/octokit";

let urlSearchParams = new URLSearchParams(location.search);

let user = urlSearchParams.has('user') ? urlSearchParams.get('user') : prompt("Enter user name:");
let repo = urlSearchParams.has('repo') ? urlSearchParams.get('repo') : prompt("Enter repo name:");
let file = urlSearchParams.has('file') ? urlSearchParams.get('file') : prompt("Enter file name:");
let branch = urlSearchParams.has('branch') ? urlSearchParams.get('branch') : "main";

let lines = [];
let cursor = 0;

function decode(base64) {
    const binString = atob(base64);
    return new TextDecoder().decode(Uint8Array.from(binString, (m) => m.codePointAt(0)));
}

function encode(txt) {
    const binString = Array.from(new TextEncoder().encode(txt), (byte) =>
        String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
}

new Octokit().request(`GET /repos/${user}/${repo}/contents/${file}?ref=${branch}`, {
        headers: {
            'If-None-Match': ''
        }
    })
    .then(({
        data: {
            content
        }
    }) => decode(content))
    .catch(() => "hl|tc|[New Page]\n")
    .then(text => {
        lines = text.split("\n");
        lines.forEach(appendNewSpan);
        refreshOutputRange();
        scroll(lines.length);
    });

window.save = (auth, targetBranch) => {
    let octokit = new Octokit({
        auth
    });
    octokit.request(`GET /repos/${user}/${repo}/contents/${file}?ref=${targetBranch || branch}`, {
            headers: {
                'If-None-Match': ''
            }
        })
        .then(({
            data: {
                sha
            }
        }) => sha).catch(_ => undefined).then(sha =>
            octokit.request(`PUT /repos/${user}/${repo}/contents/${file}`, {
                branch: targetBranch || branch,
                message: `${sha ? "update" : "create"} ${file}`,
                content: encode(lines.join("\n")),
                sha,
            }))
        .then(_ => console.log('commit successful'))
        .catch(err => console.log(err));
};

function appendNewSpan() {
    let i = document.getElementsByTagName("span").length;
    let newSpan = document.createElement("span");
    newSpan.setAttribute("id", `s${i}o`);
    newSpan.classList.add("span-output");
    document.body.appendChild(newSpan);
    newSpan.addEventListener('mousedown', () => scroll(i - cursor));
}

function removeLastSpan() {
    window[`s${document.getElementsByTagName("span").length - 1}o`].remove();
}

let supportedStyles = ["hl", "hs", "tc", "ms", "li", "i0", "i1", "i2", "i3"];

function typeset(el) {
    for (let supportedStyle of supportedStyles) {
        el.classList.remove(supportedStyle);
        if (el.innerText.startsWith(`${supportedStyle}|`)) {
            el.classList.add(supportedStyle);
            el.innerText = el.innerText.replace(`${supportedStyle}|`, "").trim();
        }
    }
    MathJax.startup.promise = MathJax.startup.promise
        .then(() => MathJax.typesetPromise([el]))
        .catch((err) => console.log('Typeset failed: ' + err.message));
}

function refreshOutputRange(start, end) {
    for (let i = (start || 0); i < (end || lines.length); i++) {
        window[`s${i}o`].innerText = lines[i];
        typeset(window[`s${i}o`]);
    }
}

function handleKeyUp() {
    lines[cursor] = window.textInput.innerText;
    refreshOutputRange(cursor, cursor + 1);
}
document.body.onkeyup = handleKeyUp;

let viMode = false;
let viModeBuffer = 0;
let viSelectMode = false;
let viClipboard = "";
const bracketPairs = {
    '(': ')',
    '{': '}',
    '[': ']'
};

function handleKeyDown(event) {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            if (cursor) {
                scroll(-1);
                removeLastSpan();
                lines.splice(cursor + 1, 1);
            }
        } else {
            lines.splice(cursor + 1, 0, " ");
            appendNewSpan();
            scroll(1);
        }
        refreshOutputRange(cursor);
        event.preventDefault();
        return false;
    } else if (event.key === 'Escape' || (event.ctrlKey && event.key === '[') || (!event.ctrlKey && event.key === 'Tab')) {
        viSelectMode = false;
        if (!viMode) {
            viMode = true;
            window.textInput.setAttribute("contenteditable", "false");
            if (window.textInput.childNodes.length) {
                const range = document.getSelection().getRangeAt(0);
                range.setStart(window.textInput.childNodes[0], Math.max(0, Math.min(window.textInput.childNodes[0].length, range.startOffset) - 1));
                range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
            }
        }
        event.preventDefault();
        return false;
    } else if (viMode) {
        if (event.key == "I" || event.key == "J") return;
        if (event.key >= "0" && event.key <= "9") {
            viModeBuffer *= 10;
            viModeBuffer += parseInt(event.key);
            return;
        } else if (event.key === "j") {
            scroll(Math.max(1, viModeBuffer));
        } else if (event.key === "k") {
            scroll(Math.min(-1, -viModeBuffer));
        } else if (viModeNavigation(event)) {
            viModeBuffer = Math.max(0, viModeBuffer - 1);
            while (viModeBuffer--) {
                viModeNavigation(event);
            }
        } else if (event.key === "v") {
            viSelectMode = !viSelectMode;
        } else if (event.key === "c" || event.key === "d" || event.key === "y") {
            viSelectMode = false;
            viClipboard = document.getSelection().toString();
            let rangeStart = document.getSelection().getRangeAt(0).startOffset;
            let rangeEnd = document.getSelection().getRangeAt(0).endOffset;
            if (event.key === "y") {
                document.getSelection().getRangeAt(0).setStart(window.textInput.childNodes[0], rangeEnd - 1);
                document.getSelection().getRangeAt(0).setEnd(window.textInput.childNodes[0], rangeEnd);    
            } else {
                window.textInput.innerText =
                    window.textInput.innerText.substring(0, rangeStart)
                    + window.textInput.innerText.substring(rangeEnd);
                let correctedRangeStart = Math.max(0, Math.min(window.textInput.innerText.length - 1, rangeStart));
                window.textInput.innerText = window.textInput.innerText.replace("  ", " ");
                document.getSelection().getRangeAt(0).setStart(window.textInput.childNodes[0], correctedRangeStart);
                document.getSelection().getRangeAt(0).setEnd(window.textInput.childNodes[0], correctedRangeStart + 1);
                if (event.key === "c") {
                    viModeTransition({ key: correctedRangeStart == rangeStart ? "i" : "a" });
                }
            }
        } else if (event.key === "p") {
            viSelectMode = false;
            let rangeEnd = document.getSelection().getRangeAt(0).endOffset;
            window.textInput.innerText =
                window.textInput.innerText.substring(0, rangeEnd)
                + viClipboard
                + window.textInput.innerText.substring(rangeEnd);
            window.textInput.innerText = window.textInput.innerText.replace("  ", " l");
            document.getSelection().getRangeAt(0).setStart(window.textInput.childNodes[0], rangeEnd - 1);
            document.getSelection().getRangeAt(0).setEnd(window.textInput.childNodes[0], rangeEnd);
        } else viModeTransition(event);
        viModeBuffer = 0;
        event.preventDefault();
        return false;
    } else if (window.textInput.innerText && bracketPairs[event.key]) {
        const range = document.getSelection().getRangeAt(0);
        const startOffset = range.startOffset;
        const previousText = window.textInput.innerText.replace('\n', ' ');
        const infix = event.key + (previousText[startOffset - 1] == '\\' ? ' \\' : '') + bracketPairs[event.key];
        window.textInput.innerText = previousText.slice(0, startOffset) + infix + previousText.slice(startOffset);
        range.setStart(window.textInput.childNodes[0], startOffset + 1);
        event.preventDefault();
        return false;
    }
}
document.body.onkeydown = handleKeyDown;

function viModeTransition(event) {
    switch (event.key) {
        case 'i':
            document.getSelection().getRangeAt(0).collapse(true);
            break;
        case 'a':
            document.getSelection().getRangeAt(0).collapse(false);
            break;
        case 'A':
            const range = document.getSelection().getRangeAt(0);
            if (window.textInput.childNodes.length) {
                range.setStart(window.textInput.childNodes[0], window.textInput.childNodes[0].length);
            }
            range.collapse(false);
            break;
        default:
            return false;
    }
    viMode = false;
    window.textInput.setAttribute("contenteditable", "true");
    window.textInput.focus();
    return true;
}

function viModeNavigation(event) {
    if (!window.textInput.childNodes.length) {
        return false;
    }
    const range = document.getSelection().getRangeAt(0);
    const atWordBreak = (i) => atLineBreak(i) || 
        window.textInput.innerText[i] === ',' ||
        window.textInput.innerText[i] === ' ' ||
        bracketPairs[window.textInput.innerText[i]];
    const atLineBreak = (i) => window.textInput.innerText[i] === '.' ||
        (window.textInput.innerText[i] === '\\' &&
            window.textInput.innerText[i + 1] === '\\');
    let rangeStart = range.startOffset;
    let rangeEnd = range.endOffset;
    let rangeLength = window.textInput.innerText.length;
    switch (event.key) {
        case 'h':
            rangeStart--;
            if (!viSelectMode) rangeEnd = rangeStart + 1;
            break;
        case 'l':
            rangeEnd++;
            if (!viSelectMode) rangeStart = rangeEnd - 1;
            break;
        case 'P':
            do {
                rangeStart--;
            } while (rangeStart > 0 && !atLineBreak(rangeStart));
            if (!viSelectMode) rangeEnd = rangeStart + 1;
            break;
        case 'N':
            do {
                rangeEnd++;
            } while (rangeEnd < rangeLength && !atLineBreak(rangeEnd - 1));
            if (!viSelectMode) rangeStart = rangeEnd - 1;
            break;
        case 'b':
            rangeStart--;
            do {
                rangeStart--;
            } while (rangeStart > 0 && !atWordBreak(rangeStart));
            if (rangeStart) rangeStart += 1;
            if (!viSelectMode) rangeEnd = rangeStart + 1;
            break;
        case 'e':
            rangeEnd++;
            do {
                rangeEnd++;
            } while (rangeEnd < rangeLength && !atWordBreak(rangeEnd - 1));
            if (rangeEnd < rangeLength) rangeEnd -= 1;
            if (!viSelectMode) rangeStart = rangeEnd - 1;
            break;
        default:
            return false;
    }
    range.setStart(window.textInput.childNodes[0], Math.max(0, Math.min(rangeLength - 1, rangeStart)));
    range.setEnd(window.textInput.childNodes[0], Math.max(1, Math.min(rangeLength, rangeEnd)));
    return true;
}

function initializeSelection() {
    window.textInput.focus();
    if (!window.textInput.childNodes.length) {
        return;
    }
    const range = document.getSelection().getRangeAt(0);
    if (!viMode) {
        range.setStart(window.textInput.childNodes[0], window.textInput.childNodes[0].length);
        range.collapse(false);
    } else {
        range.setStart(window.textInput.childNodes[0], window.textInput.childNodes[0].length - 1);
        range.setEnd(window.textInput.childNodes[0], window.textInput.childNodes[0].length);
    }
}

function scroll(i) {
    window[`s${cursor}o`].classList.remove("editing");
    cursor = Math.max(0, Math.min(lines.length - 1, cursor + i));
    window.textInput.innerText = lines[cursor];
    window[`s${cursor}o`].after(window.textInput);
    window[`s${cursor}o`].classList.add("editing");
    window.textInput.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
    initializeSelection();
}
