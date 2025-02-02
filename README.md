## Notebook
[https://aditya-r-m.github.io/notebook/?s00](https://aditya-r-m.github.io/notebook/?user=aditya-r-m&repo=notebook-pages&file=s00.tex) | [s01](https://aditya-r-m.github.io/notebook/?user=aditya-r-m&repo=notebook-pages&file=s01.tex) | [s02](https://aditya-r-m.github.io/notebook/?user=aditya-r-m&repo=notebook-pages&file=s02.tex)

The project contains a minimal web interface optimized for capturing mathematical notes with live MathJax rendering, basic Vi keybindings, and a simple local server setup to enable autosave.

The user can edit one line at a time in the text insert mode, and navigate the text in Vi Mode. A line can be formatted using `${supportedStyle}|` prefix.
Note that the Caret in Vi Mode is simulated through text selection, so it will temporarily disappear during custom text selection & when out of focus.

| Keybinding | Mode | Command |
| ---------- | ---- | ------- |
| Enter | ALL | Create line |
| Shift+Enter | ALL | Delete line |
| Esc, Ctrl+[, Tab | INS | Vi Mode |
| i | VIM | Insert before caret |
| a | VIM | Insert after caret |
| A | VIM | Insert after line end |
| h | VIM | Scroll left |
| j | VIM | Scroll down |
| k | VIM | Scroll up |
| l | VIM | Scroll right |
| b | VIM | Move to word start |
| e | VIM | Move to word end |
| P | VIM | Move to sentence start |
| N | VIM | Move to sentence end |
| v | VIM | Selection mode |
| y | VIM | copy selected text |
| d | VIM | cut selected text |
| c | VIM | cut selected text and Insert before caret |
| p | VIM | paste selected text from copy/cut operation |
| [0-9]+ | VIM | Repeat the VIM navigation command that follows |
