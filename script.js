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
}

function removeLastSpan() {
    window[`s${document.getElementsByTagName("span").length - 1}o`].remove();
}

let supportedStyles = ["hl", "hs", "tc", "ms", "li", "i1", "i2", "i3"];

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
    } else if (event.key === 'Escape' || (!event.ctrlKey && event.key === 'Tab')) {
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
        } else viModeTransition(event);
        viModeBuffer = 0;
        event.preventDefault();
        return false;
    } else if (window.textInput.innerText && bracketPairs[event.key]) {
        const range = document.getSelection().getRangeAt(0);
        const startOffset = range.startOffset;
        const previousText = window.textInput.innerText;
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
    const atLineBreak = () => window.textInput.innerText[range.startOffset] === '.' ||
        (window.textInput.innerText[range.startOffset] === '\\' &&
            window.textInput.innerText[range.startOffset + 1] === '\\');
    switch (event.key) {
        case 'h':
            range.setStart(window.textInput.childNodes[0], Math.max(0, range.startOffset - 1));
            range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
            break;
        case 'l':
            range.setStart(window.textInput.childNodes[0], Math.min(range.startOffset + 1, window.textInput.childNodes[0].length - 1));
            range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
            break;
        case '^':
            range.setStart(window.textInput.childNodes[0], 0);
            range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
            break;
        case '$':
            range.setStart(window.textInput.childNodes[0], window.textInput.childNodes[0].length - 1);
            range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
            break;
        case 'p':
            do {
                range.setStart(window.textInput.childNodes[0], Math.max(0, range.startOffset - 1));
                range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
            } while (range.startOffset && !atLineBreak());
            break;
        case 'n':
            do {
                range.setStart(window.textInput.childNodes[0], Math.min(range.startOffset + 1, window.textInput.childNodes[0].length - 1));
                range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
            } while (range.startOffset < window.textInput.childNodes[0].length - 1 && !atLineBreak());
            break;
        case 'b':
            range.setStart(window.textInput.childNodes[0], Math.max(0, range.startOffset - 1));
            while (range.startOffset &&
                window.textInput.childNodes[0].textContent[range.startOffset - 1] !== " ") {
                range.setStart(window.textInput.childNodes[0], range.startOffset - 1);
            }
            range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
            break;
        case 'e':
            range.setStart(window.textInput.childNodes[0], Math.min(range.startOffset + 1, window.textInput.childNodes[0].length - 1));
            while (range.startOffset < window.textInput.childNodes[0].length - 1 &&
                window.textInput.childNodes[0].textContent[range.startOffset + 1] !== " ") {
                range.setStart(window.textInput.childNodes[0], range.startOffset + 1);
            }
            range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
            break;
        default:
            return false;
    }
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
