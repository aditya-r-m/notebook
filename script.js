let supportedStyles = ["hl", "hs", "tc"];
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
		document.body.insertBefore(s, window.ie);
		window[`s${cs}o`].classList.add("span-output");
	}
	window[`s${cs}o`].innerText = window[`s${cs}i`].innerText;
	typeset(window[`s${cs}o`]);
}
if (document.getElementsByTagName('pre').length) {
	document.getElementsByTagName('pre')[0].innerText.split('\n')
	.forEach(line => {
		let s = document.createElement("span");
		document.body.appendChild(s);
		s.innerText = line;
	})
}
let inputSpans = Array.from(document.getElementsByTagName('span'));
for (let i = 0; i < inputSpans.length; i++) {
	inputSpans[i].setAttribute("id", `s${i}i`);
	inputSpans[i].classList.add("span-input");
	inputSpans[i].innerText = inputSpans[i].innerText || " ";
}
for (cs = 0; cs < Math.max(1, inputSpans.length); cs++) {
	createSpan();
}
cs--;
window[`s${cs}o`].classList.add("editing");
window.ie.innerText = window[`s${cs}i`].innerText;
setTimeout(() => window.ie.scrollIntoView({ behavior: "smooth", block: "center" }), 500);

function handleKeyUp(event) {
	window[`s${cs}o`].innerText = window[`s${cs}i`].innerText = window.ie.innerText || " ";
	typeset(window[`s${cs}o`]);
}
document.body.onkeyup = handleKeyUp;

let visualMode = false;
let visualModeBuffer = 0;
function handleKeyDown(event) {
	if (event.key === 'Enter') {
		scroll(1, event.shiftKey);
		event.preventDefault();
		return false;
	} else if (!visualMode
		&& (event.key === 'Escape' || (event.ctrlKey && event.key === '['))) {
		visualMode = true;
		window.ie.setAttribute("contenteditable", "false");
		window.ie.innerText = window.ie.innerText || " ";
		const range = document.getSelection().getRangeAt(0);
		range.setStart(window.ie.childNodes[0], Math.max(0, range.startOffset - 1));
		range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
		event.preventDefault();
		return false;
	} else if (visualMode) {
		if (event.key >= "0" && event.key <= "9") {
			visualModeBuffer *= 10;
			visualModeBuffer += parseInt(event.key);
			return;
		} else if (event.key === "j" || event.key === "k") {
			scroll(Math.max(1, visualModeBuffer), event.key === "k", true);
		} else if (visualModeNavigation(event)) {
			visualModeBuffer = Math.max(0, visualModeBuffer - 1);
			while (visualModeBuffer--) {
				visualModeNavigation(event);
			}
		} else if (event.key === "V") {
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], 0);
			range.setEnd(window.ie.childNodes[0], window.ie.childNodes[0].length);
		} else visualModeTransition(event);
		visualModeBuffer = 0;
		event.preventDefault();
		return false;
	}
}
document.body.onkeydown = handleKeyDown;

function visualModeTransition(event) {
	switch (event.key) {
		case 'i':
			document.getSelection().getRangeAt(0).collapse(true);
			break;
		case 'a':
			document.getSelection().getRangeAt(0).collapse(false);
			break;
		case 'A':
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], window.ie.childNodes[0].length);
			range.collapse(false);
			break;
		default: return false;
	}
	visualMode = false;
	window.ie.setAttribute("contenteditable", "true");
	window.ie.focus();
	return true;
}

function visualModeNavigation(event) {
	const range = document.getSelection().getRangeAt(0);
	switch (event.key) {
		case 'h':
			range.setStart(window.ie.childNodes[0], Math.max(0, range.startOffset - 1));
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
			break;
		case 'l':
			range.setStart(window.ie.childNodes[0], Math.min(range.startOffset + 1, window.ie.childNodes[0].length - 1));
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
			break;
		case '^':
			range.setStart(window.ie.childNodes[0], 0);
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
			break;
		case '$':
			range.setStart(window.ie.childNodes[0], window.ie.childNodes[0].length - 1);
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
			break;
		case 'b':
			range.setStart(window.ie.childNodes[0], Math.max(0, range.startOffset - 1));
			while (range.startOffset
				&& window.ie.childNodes[0].textContent[range.startOffset - 1] !== " ") {
				range.setStart(window.ie.childNodes[0], range.startOffset - 1);
			}
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
			break;
		case 'e':
			range.setStart(window.ie.childNodes[0], Math.min(range.startOffset + 1, window.ie.childNodes[0].length - 1));
			while (range.startOffset < window.ie.childNodes[0].length - 1
				&& window.ie.childNodes[0].textContent[range.startOffset + 1] !== " ") {
				range.setStart(window.ie.childNodes[0], range.startOffset + 1);
			}
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
			break;
		default: return false;
	}
	return true;
}

function initializeSelection() {
	window.ie.focus();
	const range = document.getSelection().getRangeAt(0);
	if (!visualMode) {
		range.setStart(window.ie.childNodes[0], window.ie.childNodes[0].length);
		range.collapse(false);
	} else {
		range.setStart(window.ie.childNodes[0], window.ie.childNodes[0].length - 1);
		range.setEnd(window.ie.childNodes[0], window.ie.childNodes[0].length);
	}
}
setTimeout(initializeSelection);

function scroll(i, r, soft) {
	window[`s${cs}o`].classList.remove("editing");
	let spanCount = document.getElementsByClassName("span-input").length;
	while (i--) {
		if (r) {
			cs = Math.max(cs - 1, 0);
			window.ie.after(window[`s${cs + 1}o`]);
		} else {
			cs = soft ? Math.min(cs + 1, spanCount - 1) : cs + 1;
			createSpan();
			window.ie.before(window[`s${cs}o`]);
		}
	}
	window.ie.innerText = window[`s${cs}i`].innerText;
	window[`s${cs}o`].classList.add("editing");
	window.ie.scrollIntoView({ behavior: "smooth", block: "center" });
	initializeSelection();
}

function save() {
	fetch(`http://localhost:8080/${window.location.href.replace(/^.*\//, '')}`, {
		method: 'PUT',
		headers: {
			'Content-type': 'application/json'
		},
		body: Array.from(
			document.getElementsByClassName('span-input'))
			.map(x => x.innerHTML)
			.join('\n')
	});
}
setInterval(save, 4096);
