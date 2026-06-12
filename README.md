# Project Directory overview

For this project we decided to create a seperate directory for code based gamed. These are games such as "blocky", "Hefboom", "QR code scanner" and "Simon says".
Anything related to these games can be found within their own directory.

For the standard template used within our game the relevant files can be found in the top level directory.

# CI/CD
Every time we push a commit to the main branch linters run automatically. We enabled both regular and "pretty" CSS, HTML and javaScript linters, but because of time restraints we decided to focus on fixing issues brought by the functional linters moreso than the "prettier" linters.

We have set up a [static webpage](https://fuzzy-adventure-p3zgj2m.pages.github.io/) using Github Pages, which shows
the current state of the main branch. This is updated every time we
merge a new branch into main or push changes to main. This allows us to quickly test our features on the intended devices (mobile), which helps in identifying platform specific bugs we would otherwise not encounter on our PCs. 
