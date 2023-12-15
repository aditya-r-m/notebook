let cs = 0;

window[`s${cs}`].classList.add("editing");
window.ie.scrollIntoView({ block: "center" });

function handleInput(event) {
	window[`s${cs}`].innerText = window.ie.value;
	if (event.keyCode === 13) {
		window[`s${cs}`].classList.remove("editing");
		if (event.shiftKey) {
			cs = Math.max(cs - 1, 0);
		} else {
			cs++;
		}
		if (!window[`s${cs}`]) {
			let s = document.createElement("span");
			s.setAttribute("id", `s${cs}`);
			s.innerText = " ";
			document.body.appendChild(s);
		}
		window[`s${cs}`].after(window.ie);
		window.ie.value = window[`s${cs}`].innerText;
		window[`s${cs}`].classList.add("editing");
	}
	window.ie.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}


