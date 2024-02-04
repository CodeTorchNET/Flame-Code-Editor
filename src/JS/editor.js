/**
 * @class Editor
 * @description This class is responsible for rendering the editor and handling the editor
 */
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
                require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.45.0/min/vs' }});
                require(['vs/editor/editor.main'], function () {
                    this._data.editor = monaco.editor.create(target, {
                        value: value,
                        language: language,
                        theme: 'vs-dark',
                    });
                    this._data.editor.getModel().onDidChangeContent(function(event) {
                        // Handle the content change event
                        document.dispatchEvent(new CustomEvent('fileEdited', {detail: {}}));
                    });
                }.bind(this));            
            },
            this.getFileContent = function () {
                return this._data.editor.getValue();
            }
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
                //remove all attributes of this._data.target
                for (var i = 0; i < this._data.target.attributes.length; i++) {
                    if(!(this._data.target.attributes[i].name == 'id' || !this._data.target.attributes[i].name == 'class' || !this._data.target.attributes[i].name == 'style')){
                    this._data.target.removeAttribute(this._data.target.attributes[i].name);
                    }
                }
                if (this._data.editor != null) {
                    this._data.editor.dispose();
                    this._data.editor = null;
                }
            },
            this.languageEquivalent = function (ext) {
                if (this._data.languageEquivalents[ext]) {
                    return this._data.languageEquivalents[ext];
                } else {
                    return this._data.languageEquivalents['unknown'];
                }
            },
            this._data = {
                welcomeHTML: null,
                target: null,
                currentScreen: 'welcome',
                editor: null,
                languageEquivalents: {
                    js: 'javascript',
                    html: 'html',
                    css: 'css',
                    jsx: 'javascript',
                    json: 'json',
                    md: 'markdown',
                    png: 'image',
                    svg: 'image',
                    vue: 'vue',
                    txt: 'text',
                    unknown: 'text'
                }
            }
    }
}