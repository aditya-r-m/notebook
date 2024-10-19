## Notebook
[https://aditya-r-m.github.io/notebook/?s00](https://aditya-r-m.github.io/notebook/?user=aditya-r-m&repo=notebook-pages&file=s00.tex) | [s01](https://aditya-r-m.github.io/notebook/?user=aditya-r-m&repo=notebook-pages&file=s01.tex) | [s02](https://aditya-r-m.github.io/notebook/?user=aditya-r-m&repo=notebook-pages&file=s02.tex)

The project contains a minimal web interface optimized for capturing mathematical notes with live MathJax rendering, basic Vi keybindings, and github storage integration through octokit.

The user can edit one line at a time in the text insert mode, and navigate the text in Vi Mode. A line can be formatted using prefixes `h[l,s]|tc|li|` for [large,small]-headings, [centered,monospace]-text, & [list,indented]-items.
Note that the Caret in Vi Mode is simulated through text selection, so it will temporarily disappear during custom text selection & when out of focus.

| Keybinding | Mode | Command |
| ---------- | ---- | ------- |
| Enter | ALL | Create line |
| Shift+Enter | ALL | Delete line |
| Esc, Tab | INS | Vi Mode |
| i | VIM | Insert before caret |
| a | VIM | Insert after caret |
| A | VIM | Insert after line end |
| h | VIM | Scroll left |
| j | VIM | Scroll down |
| k | VIM | Scroll up |
| l | VIM | Scroll right |
| ^ | VIM | Move to line start |
| $ | VIM | Move to line end |
| p | VIM | Move to sentence start |
| n | VIM | Move to sentence end |
| b | VIM | Move to word start |
| e | VIM | Move to word end |
| [0-9]+ | VIM | Repeat the VIM command that follows |

The convenience function `save(personal_access_token, targetBranch?)` is available in browser console to directly commit changes to the notebook pages repository on github.
