//instead of looping through whole HTML at parent itemSubContent then look (each element is known by itemSubContent id)
class TopBar {
    constructor() {
        this.init = function (el) {
            if (typeof el == "undefined") {
                throw new Error("No element provided")
            } else if (typeof el == 'object') {
                this._data.target = el
            } else {
                throw new Error("Element is not an object")
            }
        }
        this.add = function () {
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
            currID: 0,
            }
    }

}