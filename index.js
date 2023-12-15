function typeset(el) {
	MathJax.startup.promise = MathJax.startup.promise
		.then(() => MathJax.typesetPromise([el]))
		.catch((err) => console.log('Typeset failed: ' + err.message));
}

let cs = 0;
function createSpan() {
	if (!window[`s${cs}o`]) {
		let s = document.createElement("span");
		s.setAttribute("id", `s${cs}i`);
		document.body.appendChild(s);
		window[`s${cs}i`].classList.add("span-input");
		s = document.createElement("span");
		s.setAttribute("id", `s${cs}o`);
		document.body.appendChild(s);
		window[`s${cs}o`].classList.add("span-output");
		window[`s${cs}o`].classList.add("editing");
		window[`s${cs}o`].after(window.ie);
	}
}
createSpan();

function centerInput() {
	setTimeout(() => window.ie.scrollIntoView({ behavior: "smooth", block: "center" }, 500));
}

function handleInput(event) {
	window[`s${cs}i`].innerText = window.ie.value;
	window[`s${cs}o`].innerText = window.ie.value;
	typeset(window[`s${cs}o`]);
	if (event.keyCode === 13) {
		window[`s${cs}o`].classList.remove("editing");
		if (event.shiftKey) {
			cs = Math.max(cs - 1, 0);
		} else {
			cs++;
		}
		createSpan();
		window.ie.value = window[`s${cs}i`].innerText;
		window[`s${cs}o`].classList.add("editing");
		window[`s${cs}o`].after(window.ie);
		centerInput();
	}
}


