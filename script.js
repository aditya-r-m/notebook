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
let inputSpanLength = document.getElementsByClassName('span-input').length;
for (cs = 0; cs < Math.max(1, inputSpanLength); cs++) {
	createSpan();
}
cs--;
window[`s${cs}o`].classList.add("editing");
window.ie.value = window[`s${cs}i`].innerText;

function centerInput() {
	setTimeout(() => window.ie.scrollIntoView({ behavior: "smooth", block: "center" }));
}

function handleInput(event) {
	window[`s${cs}i`].innerText = window[`s${cs}o`].innerText = window.ie.value;
	typeset(window[`s${cs}o`]);
	if (event.keyCode === 13) {
		window[`s${cs}o`].classList.remove("editing");
		if (event.shiftKey) {
			cs = Math.max(cs - 1, 0);
			window.ie.after(window[`s${cs + 1}o`]);
		} else {
			cs++;
			createSpan();
			window.ie.before(window[`s${cs}o`]);
		}
		window.ie.value = window[`s${cs}i`].innerText;
		window[`s${cs}o`].classList.add("editing");
		centerInput();
	}
}

setInterval(function() {
	fetch('http://localhost:8080/data/backup.html', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: Array.from(
			document.getElementsByClassName('span-input'))
		.map(x => x.outerHTML).join('\n')
    });
}, 2048);
