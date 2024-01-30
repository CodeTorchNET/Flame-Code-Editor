class TopBar {
    constructor() {
        this.init = function (el) {
            if (typeof el == "undefined") {
                throw new Error("No element provided")
            } else if (typeof el == 'object') {
                new Sortable(el, {
                    animation: 150,
                    draggable: ".Tab",
                    onChoose: function (evt) {
                        this.setActive(evt.item.id);
                    }.bind(this),
                });
                this._data.target = el
            } else {
                throw new Error("Element is not an object")

            }
        }
        this.add = function (name, icon_name, edited = false) {
            if (this._data.filesKnown.indexOf(icon_name) != -1) {
                var element = document.createElement("div");
                var icon = document.createElement("img");
                icon.src = "/assets/" + this._data.fileIcons[icon_name];
                icon.className = "icon";
                element.appendChild(icon);
                element.className = "Tab";
                var p = document.createElement("p");
                p.innerHTML = name;
                element.appendChild(p);
                var i = document.createElement("div");
                i.className = 'actions';
                if (edited) {
                    i.innerHTML = this._data.editedSVG;
                    element.setAttribute('edited', "true");
                } else {
                    i.innerHTML = this._data.crossedSVG;
                }
                function calculateNextActive(ParentThis) {
                    //calculate next active element
                    var nextActive = null;
                    if (element.nextSibling != null) {
                        nextActive = element.nextSibling;
                    } else if (element.previousSibling != null) {
                        nextActive = element.previousSibling;
                    }
                    //set next active element
                    if (nextActive != null && (nextActive.id != undefined && nextActive.id.includes("Tab"))) {
                        ParentThis.setActive(nextActive.id);
                    } else {
                        ParentThis._data.activeElement = null;
                    }
                }

                function internalEvents(ParentThis) {
                    const target = ParentThis._data.target;
                    const editedSVG = ParentThis._data.editedSVG;
                    const crossedSVG = ParentThis._data.crossedSVG;
                    i.children[0].addEventListener("click", function () {
                        //check if current tab is active
                        if (element.classList.contains("active")) {
                            calculateNextActive(ParentThis);
                        }
                        element.remove();
                        target.dispatchEvent(new CustomEvent('tabClosed', { detail: { id: element.id } }));
                    })
                    i.children[0].addEventListener('mouseover', function () {
                        if (element.getAttribute('edited') == "true") {
                            i.innerHTML = crossedSVG;
                            internalEvents(ParentThis);
                        }
                    });
                    i.children[0].addEventListener('mouseout', function () {
                        if (element.getAttribute('edited') == "true") {
                            i.innerHTML = editedSVG;
                            internalEvents(ParentThis);
                        }
                    });
                    i.children[0].addEventListener('mouseup', function () {
                        //check if current tab is active
                        if (element.classList.contains("active")) {
                            calculateNextActive(ParentThis);
                        }
                        element.remove();
                        target.dispatchEvent(new CustomEvent('tabClosed', { detail: { id: element.id } }));
                    });
                }
                internalEvents(this);
                element.appendChild(i);
                element.id = 'TopBarTab' + this._data.currID;
                element.addEventListener('click', function () {
                    this.setActive(element.id);
                }.bind(this));
                element.addEventListener('mouseover', function () {
                    //check if active
                    if (!(element.classList.contains("active"))) {
                        i.style.visibility = "visible";
                    }
                })
                element.addEventListener('mouseout', function () {
                    if (!(element.classList.contains("active"))) {
                    i.style.visibility = "hidden";
                    }
                })
                this._data.currID++;
                this._data.target.appendChild(element);
                //if active doesn't exist than set this tab as active
                if (this._data.activeElement == null) {
                    this.setActive(element.id);
                }else{
                    i.style.visibility = "hidden";
                }
                return element.id;
            } else {
                throw new Error("File type is not known");
            }
        }
        this.setActive = function (id) {
            if (this._data.activeElement != null) {
                this._data.target.children[this._data.activeElement].classList.remove("active");
            }
            this._data.target.children[id].classList.add("active");
            this._data.activeElement = id;
            this._data.target.dispatchEvent(new CustomEvent('tabChanged', { detail: { id: id } }));
        }
        //internal data
        this._data = {
            filesKnown: ['js', 'html', "css", "jsx", 'pdf', "eps", "ttf", "otf", "woff", "woff2", "eot", "json", 'md', 'png', 'svg', 'vue', 'jpeg', 'jpg', 'ico', 'gif', 'bmp', 'tiff', 'tif', 'mp3', 'wav', 'flac', 'aac', 'ogg'],//add zip,video formats
            fileIcons: {
                js: "JS.svg",
                html: "HTML.svg",
                css: "CSS.svg",
                jsx: "react.svg",
                pdf: "PDF.svg",
                eps: "EPS.svg",
                ttf: "Font.svg",
                otf: "Font.svg",
                woff: "Font.svg",
                woff2: "Font.svg",
                eot: "Font.svg",
                json: "JSON.svg",
                md: "MD.svg",
                png: "PNG.svg",
                svg: "SVG.svg",
                vue: "Vue.svg",
                jpeg: "PNG.svg",
                jpg: "PNG.svg",
                ico: "PNG.svg",
                gif: "PNG.svg",
                bmp: "PNG.svg",
                tiff: "PNG.svg",
                tif: "PNG.svg",
                mp3: "audio.svg",
                wav: "audio.svg",
                flac: "audio.svg",
                aac: "audio.svg",
                ogg: "audio.svg",
            },
            target: null,
            activeElement: null,
            currID: 0,
            editedSVG: '<div></div>',
            crossedSVG: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>',
        }
    }

}