

let currentSpan = 0;

function handleInput(event) {
	if (event.keyCode === 13) {
		if (event.shiftKey) {
			currentSpan = Math.max(currentSpan - 1, 0);
		} else {
			currentSpan++;
		}
		if (!window[`s${currentSpan}`]) {
			let s = document.createElement("span");
			s.setAttribute("id", `s${currentSpan}`);
			document.body.appendChild(s);
		}
		window[`s${currentSpan}`].after(window["ie"]);
	} else {

	}
}


