class Editor {
    constructor() {
        this.init = function (el) {
            if (typeof el == "undefined") {
                throw new Error("No element provided")
            } else if (typeof el == 'object') {
                this._data.target = el;
                this._data.welcomeHTML = el.innerHTML;
            } else {
                throw new Error("Element is not an object")
            }
        },
            this.renderFileEditor = function (value,language) {
                this._cleanUp();
                this._data.currentScreen = 'editor';
                const target = this._data.target;
                var editor = this._data.editor;
                require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.45.0/min/vs' }});
                require(['vs/editor/editor.main'], function () {
                    editor = monaco.editor.create(target, {
                        value: value,
                        language: language,
                        theme: 'vs-dark',
                    });
                });            
            },
            this.renderImageEditor = function () {
            },
            this.renderError = function () {
            },
            this.renderWelcome = function () {
                this._cleanUp();
                this._data.target.innerHTML = this._data.welcomeHTML;
            },
            this._cleanUp = function () {
                this._data.target.innerHTML = '';
                if (this._data.editor != null) {
                    this._data.editor.despose();
                    this._data.editor = null;
                }
            },
            this._data = {
                welcomeHTML: null,
                target: null,
                currentScreen: 'welcome',
                editor: null,
            }
    }
}