function typeset(el) {
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
let inputSpans = Array.from(document.getElementsByTagName('span'));
for (let i = 0; i < inputSpans.length; i++) {
	inputSpans[i].setAttribute("id", `s${i}i`);
	inputSpans[i].classList.add("span-input");
}
for (cs = 0; cs < Math.max(1, inputSpans.length); cs++) {
	createSpan();
}
cs--;
window[`s${cs}o`].classList.add("editing");
window.ie.innerText = window[`s${cs}i`].innerText;
window.ie.scrollIntoView({ behavior: "smooth", block: "center" });

function initializeSelection() {
	window.ie.focus();
	const range = document.getSelection().getRangeAt(0);
	range.setStart(window.ie.childNodes[0], window.ie.childNodes[0].length);
	range.collapse(false);
}
setTimeout(initializeSelection);

let visualMode = false;
function handleKeyUp(event) {
	if (!visualMode) {
		if (event.ctrlKey && event.key === '[') {
			visualMode = true;
			window.ie.setAttribute("contenteditable", "false");
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], Math.max(0, range.startOffset - 1));
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
		} else if (event.key === 'Enter') {
			scroll(1, event.shiftKey);
		} else {
			window[`s${cs}i`].innerText = window[`s${cs}o`].innerText = window.ie.innerText;
			typeset(window[`s${cs}o`]);
		}
	} else {
		if (event.key === "j" || event.key === "k") {
			scroll(1, event.key === "k");
		}
		if (event.key === 'i') {
			visualMode = false;
			window.ie.setAttribute("contenteditable", "true");
			window.ie.focus();
			document.getSelection().getRangeAt(0).collapse(true);
		}
		if (event.key === 'a') {
			visualMode = false;
			window.ie.setAttribute("contenteditable", "true");
			window.ie.focus();
			document.getSelection().getRangeAt(0).collapse(false);
		}
		if (event.key === 'A') {
			visualMode = false;
			window.ie.setAttribute("contenteditable", "true");
			window.ie.focus();
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], window.ie.childNodes[0].length);
			range.collapse(false);
		}
		if (event.key === 'h') {
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], Math.max(0, range.startOffset - 1));
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
		}
		if (event.key === 'l') {
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], Math.min(range.startOffset + 1, window.ie.childNodes[0].length - 1));
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
		}
		if (event.key === "^") {
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], 0);
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
		}
		if (event.key === "$") {
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], window.ie.childNodes[0].length - 1);
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
		}
		if (event.key === "V") {
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], 0);
			range.setEnd(window.ie.childNodes[0], window.ie.childNodes[0].length);
		}
		if (event.key === "b") {
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], Math.max(0, range.startOffset - 1));
			while (range.startOffset
				&& window.ie.childNodes[0].textContent[range.startOffset - 1] !== " ") {
				range.setStart(window.ie.childNodes[0], range.startOffset - 1);
			}
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
		}
		if (event.key === "e") {
			const range = document.getSelection().getRangeAt(0);
			range.setStart(window.ie.childNodes[0], Math.min(range.startOffset + 1, window.ie.childNodes[0].length - 1));
			while (range.startOffset < window.ie.childNodes[0].length - 1
				&& window.ie.childNodes[0].textContent[range.startOffset + 1] !== " ") {
				range.setStart(window.ie.childNodes[0], range.startOffset + 1);
			}
			range.setEnd(window.ie.childNodes[0], range.startOffset + 1);
		}
	}
}
document.body.onkeyup = handleKeyUp;

function handleKeyDown(event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		return false;
	}
}
document.body.onkeydown = handleKeyDown;

function scroll(i, r) {
	window[`s${cs}o`].classList.remove("editing");
	while (i--) {
		if (r) {
			cs = Math.max(cs - 1, 0);
			window.ie.after(window[`s${cs + 1}o`]);
		} else {
			cs++;
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
	fetch('http://localhost:8080/data/backup.html', {
		method: 'PUT',
		headers: {
			'Content-type': 'application/json'
		},
		body: Array.from(
			document.getElementsByClassName('span-input'))
			.map(x => x.outerHTML.replace(/^<span.*?>/, "<span>"))
			.join('\n')
	});
}
setInterval(save, 4096);
