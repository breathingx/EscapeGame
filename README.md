
# Project Directory overview

This project contains four types of folders: **Utility folders, Text folders, Game Folders and Other Page folders.
#### The ***Utility* folders** contain important data for the project:
* **.github** : contains the settings for the linters.
* **fonts** : contains the company fonts, including *Monstserrat* and different versions of *Right Grotesk*.

----
#### The ***text* folders** contain JSON files which are used for the text content of the site. If any text (questions, explanations) needs to be changed, it can be done in these folders:
* **data** : contains the puzzles and their resulting answers, including hints and bonus questions.
----
#### The ***Game* folders** contain html, css and JS files specific to the digital mini-games included in the website:
* **blockly** : contains the blockly-based programming game, including the prebuilt blockly source code. This game is currently in the *Programma* track. 
* **HefboomCompleet** : contains the adjustable lever mini-game. This game is currently in the *Aandrijving* track.
* **simon-says** : contains the "Simon Says" / "Toon Zegt" mini-game. This game is currently not present in any track as the museum has not finalized its vision for the placement of the game in the flow. The game **is** fully functional and can be easily added to any track.
* **perfect-pitch** : contains the *Toonladder* minigame. This game is currently in the *Klankbron* track.
---
#### The ***Other Page* folders** contain html, css and JS files specific to pages in the general flow of the website:
* **video** : contains the page where each team gets to see the intro/outro video specific to their track.
* **uitleg** : contains the introductory explanation page for each track.
* **QRScanner** : contains the page with camera functionality for teams to scan a QR code which gives them their team. 
* **resultaat** : contains the page which shows the team their final time and score for their track.

----
All files pertaining to the general flow of the site are in the project root, including the main **script.js**, the question **template.html** and the **index.html** start page.

# Running Instructions
To run this project locally:
1. **Clone** the repository
2. **Navigate** to the project root directory
3. **Open** the *index.html* file using a web browser, or host it via a local live server.

# CI/CD
Every time a commit is pushed to the main branch, linters run automatically. We enabled both regular and "pretty" CSS, HTML and JavaScript linters. We decided to focus on fixing issues brought by the functional linters moreso than the "prettier" linters, as fixing the stylistic errors they raise in documents that existed before implementing linters would require tracing a lot of variable and ID names throughout the project which we fear would cause unforseen bugs.

We have set up a [static webpage](https://fuzzy-adventure-p3zgj2m.pages.github.io/) using Github Pages, which shows
the current state of the main branch. This is updated every time changes are made to the main branch. This allows us to quickly test our features on the intended devices (mobile), which helps in identifying platform specific bugs we would otherwise not encounter on our PCs. 
