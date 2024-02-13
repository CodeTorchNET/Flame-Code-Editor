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
            this.renderFileEditor = function (value, language) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    value = event.target.result;
                    this._cleanUp();
                    this._data.currentScreen = 'editor';
                    const target = this._data.target;
                    require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });
                    require(['vs/editor/editor.main'], function () {
                        this._data.editor = monaco.editor.create(target, {
                            value: value,
                            language: language,
                            theme: document.body.classList.contains('light') ? '' : 'vs-dark',
                            automaticLayout: true
                        });
                        this._data.editor.getModel().onDidChangeContent(function (event) {
                            // Handle the content change event
                            document.dispatchEvent(new CustomEvent('fileEdited', { detail: {} }));
                        });
                    }.bind(this));
                }.bind(this);
                reader.readAsText(value);
            },
            this.getFileContent = function () {
                return this._data.editor.getValue();
            }
        this.renderImageEditor = function (imageDataResponse) {
            this._cleanUp();
            var url = URL.createObjectURL(imageDataResponse);
            var imgElement = document.createElement('img');
            imgElement.src = url;
            imgElement.classList.add('imageViewer');
            this._data.currentScreen = 'image';
            this._data.target.innerHTML = '';
            this._data.target.appendChild(imgElement);
        },
            this.renderVideoEditor = function (videoDataResponse, fileName) {
                this._cleanUp();
                var url = URL.createObjectURL(videoDataResponse);
                var div = document.createElement('div');
                var div2 = document.createElement('div');
                div2.id = 'videoDownloader';
                div2.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>Download';
                div2.addEventListener('click', function () {
                    function downloadBlob(blob, fileName) {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }
                    downloadBlob(videoDataResponse, fileName);
                });
                div.classList.add('videoViewer');
                var videoElement = document.createElement('video');
                videoElement.src = url;
                videoElement.controls = true;
                div.appendChild(div2);
                div.appendChild(videoElement);
                this._data.currentScreen = 'video';
                this._data.target.innerHTML = '';
                this._data.target.appendChild(div);
            }
        this.renderError = function (showDownload = true, Blob, fileName) {
            const baseHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    class="mainSVG">
                    <path stroke-linecap="round" stroke-linejoin="round"
                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
                </svg>
                <p class="title">An error occured while trying to preview this file</p>
                <p class="subtitle">If you want you can still open it</p>
                <div class="buttons">
                    <div id="videoDownloader" style="margin-right: 10px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                        class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3">
                        </path>
                    </svg>Download
                    </div>
                    <div style="margin-left: 0px;" id="OpenInEditorOverride">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                        class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                        d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                    </svg>Open in Editor anyways
                    </div>
                </div>`;
            this._cleanUp();
            var div = document.createElement('div');
            div.classList.add('errorScreen');
            div.innerHTML = baseHTML;
            this._data.target.appendChild(div);
            document.getElementById('OpenInEditorOverride').addEventListener('click', function () {
                this.renderFileEditor(Blob, this.languageEquivalent(fileName.split('.').pop()));
            }.bind(this));
            if (showDownload) {
                document.getElementById('videoDownloader').addEventListener('click', function () {
                    function downloadBlob(blob, fileName) {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }
                    downloadBlob(Blob, fileName);
                });
            } else {
                document.getElementById('videoDownloader').remove();
                document.getElementById('OpenInEditorOverride').style.marginLeft = 'auto'
            }
        },
            this.renderWelcome = function () {
                this._cleanUp();
                this._data.target.innerHTML = this._data.welcomeHTML;
            },
            this._cleanUp = function () {
                this._data.target.innerHTML = '';
                //remove all attributes of this._data.target
                for (var i = 0; i < this._data.target.attributes.length; i++) {
                    if (!(this._data.target.attributes[i].name == 'id' || !this._data.target.attributes[i].name == 'class' || !this._data.target.attributes[i].name == 'style')) {
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