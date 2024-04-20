let page = window.location.search.replace("?", "");
if (!page) page = "s00_empirical_mean_convergence";

let supportedStyles = ["hl", "hs", "li", "tc"];
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

let cs = 0;
function createSpan() {
	if (!window[`s${cs}i`]) {
		let s = document.createElement("span");
		s.setAttribute("id", `s${cs}i`);
		document.body.appendChild(s);
		s.innerText = " ";
		window[`s${cs}i`].classList.add("span-input");
	}
	if (!window[`s${cs}o`]) {
		s = document.createElement("span");
		s.setAttribute("id", `s${cs}o`);
		document.body.insertBefore(s, window.textInput);
		window[`s${cs}o`].classList.add("span-output");
	}
	window[`s${cs}o`].innerText = window[`s${cs}i`].innerText;
	typeset(window[`s${cs}o`]);
}

function handleKeyUp(event) {
	window[`s${cs}o`].innerText = window[`s${cs}i`].innerText = window.textInput.innerText || " ";
	typeset(window[`s${cs}o`]);
}
document.body.onkeyup = handleKeyUp;

let viMode = false;
let viModeBuffer = 0;
function handleKeyDown(event) {
	if (event.key === 'Enter') {
		scroll(1, event.shiftKey);
		event.preventDefault();
		return false;
	} else if (!viMode
		&& (event.key === 'Escape' || (event.ctrlKey && event.key === '['))) {
		viMode = true;
		window.textInput.setAttribute("contenteditable", "false");
		if (!window.textInput.innerText) window.textInput.innerText = " ";
		const range = document.getSelection().getRangeAt(0);
		range.setStart(window.textInput.childNodes[0], Math.max(0, range.startOffset - 1));
		range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
		event.preventDefault();
		return false;
	} else if (viMode) {
		if (event.key == "I" || event.key == "J") return;
		if (event.key >= "0" && event.key <= "9") {
			viModeBuffer *= 10;
			viModeBuffer += parseInt(event.key);
			return;
		} else if (event.key === "j" || event.key === "k") {
			scroll(Math.max(1, viModeBuffer), event.key === "k", true);
		} else if (viModeNavigation(event)) {
			viModeBuffer = Math.max(0, viModeBuffer - 1);
			while (viModeBuffer--) {
				viModeNavigation(event);
			}
		} else viModeTransition(event);
		viModeBuffer = 0;
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
			range.setStart(window.textInput.childNodes[0], window.textInput.childNodes[0].length);
			range.collapse(false);
			break;
		default: return false;
	}
	viMode = false;
	window.textInput.setAttribute("contenteditable", "true");
	window.textInput.focus();
	return true;
}

function viModeNavigation(event) {
	const range = document.getSelection().getRangeAt(0);
	const atLineBreak = () => window.textInput.innerText[range.startOffset] === '.'
		|| (window.textInput.innerText[range.startOffset] === '\\'
			&& window.textInput.innerText[range.startOffset + 1] === '\\');
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
			while (range.startOffset
				&& window.textInput.childNodes[0].textContent[range.startOffset - 1] !== " ") {
				range.setStart(window.textInput.childNodes[0], range.startOffset - 1);
			}
			range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
			break;
		case 'e':
			range.setStart(window.textInput.childNodes[0], Math.min(range.startOffset + 1, window.textInput.childNodes[0].length - 1));
			while (range.startOffset < window.textInput.childNodes[0].length - 1
				&& window.textInput.childNodes[0].textContent[range.startOffset + 1] !== " ") {
				range.setStart(window.textInput.childNodes[0], range.startOffset + 1);
			}
			range.setEnd(window.textInput.childNodes[0], range.startOffset + 1);
			break;
		default: return false;
	}
	return true;
}

function initializeSelection() {
	window.textInput.focus();
	const range = document.getSelection().getRangeAt(0);
	if (!viMode) {
		range.setStart(window.textInput.childNodes[0], window.textInput.childNodes[0].length);
		range.collapse(false);
	} else {
		range.setStart(window.textInput.childNodes[0], window.textInput.childNodes[0].length - 1);
		range.setEnd(window.textInput.childNodes[0], window.textInput.childNodes[0].length);
	}
}

function scroll(i, r, soft) {
	window[`s${cs}o`].classList.remove("editing");
	let spanCount = document.getElementsByClassName("span-input").length;
	while (i--) {
		if (r) {
			cs = Math.max(cs - 1, 0);
			window.textInput.after(window[`s${cs + 1}o`]);
		} else {
			cs = soft ? Math.min(cs + 1, spanCount - 1) : cs + 1;
			createSpan();
			window.textInput.before(window[`s${cs}o`]);
		}
	}
	window.textInput.innerText = window[`s${cs}i`].innerText;
	window[`s${cs}o`].classList.add("editing");
	window.textInput.scrollIntoView({ behavior: "smooth", block: "center" });
	initializeSelection();
}

function load() {
	return fetch(`${window.location.href.replace(/\?.*/, '')}/pages/${page}.tex`, {
		'method': 'GET',
		'Content-type': 'text/plain'
	})
		.then(res => res.text())
		.then(txt => txt.split("\n").forEach((line, i) => {
			let s = document.createElement("span");
			document.body.appendChild(s);
			s.setAttribute("id", `s${i}i`);
			s.classList.add("span-input");
			s.innerText = line || " ";
			cs = i;
			createSpan();
		}))
		.then(() => {
			window[`s${cs}o`].classList.add("editing");
			window.textInput.innerText = window[`s${cs}i`].innerText;
			createSpan();
			setTimeout(() => {
				window.textInput.scrollIntoView({ behavior: "smooth", block: "center" });
				initializeSelection();
			}, 256);
		});
}

function save() {
	return fetch(`${window.location.href.replace(/\?.*/, '')}/pages/${page}.tex`, {
		method: 'PUT',
		headers: {
			'Content-type': 'application/json'
		},
		body: Array.from(
			document.getElementsByClassName('span-input'))
			.map(x => x.innerText)
			.join('\n')
	}).then(res => res.ok ? Promise.resolve() : Promise.reject(res));
}

function autoSave() {
	return new Promise(r => setTimeout(r, 2048))
		.then(save)
		.then(autoSave)
		.catch(r => {
			window.sourceLink.style.display = 'block';
			console.log(r)
		});
}

load(); //.then(autoSave);
