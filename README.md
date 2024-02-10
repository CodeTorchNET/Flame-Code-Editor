# Flame Code Editor

Welcome to Flame, the editor that CodeTorch uses for its code editor. Flame is a simple, yet powerful code editor that is built on top of Monaco Editor. Flame is built in basic HTML, CSS, and JavaScript. Flame is also open source, so you can contribute to the project if you want to.

# Install

To install Flame, do the following:

# Run using Docker (recommended)

1. Clone the repository: `git clone https://github.com/CodeTorchNET/Flame-Code-Editor/tree/main`
2. cd into the directory: `cd Flame-Code-Editor` than into `src` folder
3. run `docker build -t flame-code-editor .`
4. then run `docker run -d -p 8080:80 flame-code-editor`
5. You should be able to access the editor at `http://localhost:8080`

# Run using a local server

1. Clone the repository: `git clone https://github.com/CodeTorchNET/Flame-Code-Editor/tree/main`
2. copy the `src` folder to your project (example to an `apache` server or a `LAMP` stack) (you need PHP for this to work)
3. THAT'S IT!!!! Enjoy Flame!