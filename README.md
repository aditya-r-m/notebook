## Notebook

The project contains a minimal web interface optimized for capturing mathematical notes with live MathJax rendering & basic Vi keybindings.

The user can edit one line at a time in the normal text insert mode, and navigate the page in Vi Mode. A line can be formatted using prefixes `h[l,s]|tc|li|` for [large,small]-headings, centered-text, & list-items.
Note that the Caret in Vi Mode is simulated through text selection, so it will temporarily disappear during custom text selection & when out of focus.


**Live Demo** : https://aditya-r-m.github.io/notebook/?s00_empirical_mean_convergence

The following convenience function available in browser console can be used to directly commit changes to the notebook repository pages on github,
```js
commit(personal_access_token, github_user_name, notebook_page, committer_name, committer_email, commit_message);
```


**Local Setup** : There is also a simple python server script which provides local auto-save functionality that can be enabled in script.js.

```console
# Download Source
git clone https://github.com/aditya-r-m/notebook.git && cd notebook

# Read-only Server
python3 -m http.server

# Read-Write Server
python3 server.py
```


| Keybinding | Mode | Command |
| ---------- | ---- | ------- |
| Enter | ALL | Scroll down, Create new line |
| Shift+Enter | ALL | Scroll up |
| Esc, Ctrl+[ | INS | Vi Mode |
| i | VIM | Insert before caret |
| a | VIM | Insert after caret |
| A | VIM | Insert after line end |
| h | VIM | Scroll left |
| j | VIM | Scroll down |
| k | VIM | Scroll up |
| l | VIM | Scroll right |
| ^ | VIM | Move to line start |
| $ | VIM | Move to line end |
| b | VIM | Move to previous word start |
| e | VIM | Move to current word end |
| [0-9]+ | VIM | Repeat the VIM command that follows |adityamrtm@penguin:~/notebook$ 
