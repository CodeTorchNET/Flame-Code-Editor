class TopBar {
    constructor() {
        this.init = function (el) {
            if (typeof el == "undefined") {
                throw new Error("No element provided")
            } else if (typeof el == 'object') {
                new Sortable(el, {
                    animation: 150,
                    chosenClass: "active",
                    draggable: ".Tab",
                });
                this._data.target = el
            } else {
                throw new Error("Element is not an object")

            }
        }
        this.add = function (name, icon_name, edited = false) {
         if(this._data.filesKnown.indexOf(icon_name) != -1){
            var element = document.createElement("div");
            var icon = document.createElement("img");
            console.log(icon_name,this._data.filesKnown.indexOf(icon_name))
            icon.src = "/assets/" + this._data.fileIcons[icon_name];
            icon.className = "icon";
            element.appendChild(icon);
            element.className = "Tab";
            var p = document.createElement("p");
            p.innerHTML = name;
            element.appendChild(p);
            var i = document.createElement("div");
            i.className = 'actions';
            if(edited){
                i.innerHTML = this._data.editedSVG;
            }else{
                i.innerHTML = this._data.crossedSVG;
            }
            element.appendChild(i);
            this._data.target.appendChild(element);
         }else{
            throw new Error("File type is not known");
         }
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
            editedSVG: '<div></div>',
            crossedSVG: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>',
        }
    }

}