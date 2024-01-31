//instead of looping through whole HTML at parent itemSubContent then look (each element is known by itemSubContent id)
class Sidebar {
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
        this.add = function (path, name, type = 'folder', icon_name) {
            if (type == 'folder') {
                //check if folder name exists at current depth - FUTURE
                var div = document.createElement('div');
                div.className = "itemParent active";
                div.id = 'sidebar' + this._data.currID;
                this._data.currID++
                div.innerHTML = `
                <div class="item folder">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <p>`+ name + `</p>
            </div>
            <div id="itemSubContent`+ div.id + `" class="itemSubContent">
            </div>`
                //add to current files
                var fileData = {
                    name: name,
                    path: path,
                    type: 'folder',
                    icon_name: icon_name,
                    children: [],
                    id: div.id,
                }
                path = this._handlePaths(path);
                if (path.length == 0) {
                    //add to base current files
                    this._data.currentFiles.push(fileData);
                    this._data.target.appendChild(div);
                } else {
                    //add to current depth
                    var id = this.handlePaths(path, fileData);
                    //append to target
                    var parent = document.getElementById(id);
                    parent.children[1].appendChild(div);
                }
                //append to target
                return div.id;

            } else if (type == 'file') {
                if (this._data.filesKnown.indexOf(icon_name) != -1) {
                    var div = document.createElement('div');
                    div.className = "item file";
                    div.id = 'sidebar' + this._data.currID;
                    this._data.currID++
                    var img = document.createElement('img');
                    img.src = "/assets/" + this._data.fileIcons[icon_name];
                    div.appendChild(img);
                    var p = document.createElement('p');
                    p.innerHTML = name;
                    div.appendChild(p);
                    //add to current files
                    var fileData = {
                        name: name,
                        path: path,
                        type: 'file',
                        icon_name: icon_name,
                        id: div.id,
                    }
                    path = this._handlePaths(path);
                    if (path.length == 0) {
                        //add to base current files
                        this._data.currentFiles.push(fileData);
                        //append to target
                        this._data.target.appendChild(div);
                    } else {
                        //add to current depth
                        var id = this.handlePaths(path, fileData);
                        //append to target
                        var parent = document.getElementById(id);
                        parent.children[1].appendChild(div);
                    }
                    return div.id;
                } else {
                    throw new Error("Unknown icon name")
                }
            } else {
                throw new Error("Unknown type (expected 'folder' or 'file') got " + type)
            }
        },
            this._handlePaths = function (path) {
                return path.split('/').filter(element => element !== "");
            },
            this.handlePaths = function (path, appendedData) {
                //expect array
                if (appendedData == undefined) {
                    throw new Error("No appended data provided")
                }
                if (typeof path == 'string') {
                    path = this._handlePaths(path);
                }
                var currentDepth = this._data.currentFiles;
                var currentDepthID = this._data.target.id;
                function findInArray(array, name) {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i].name == name && array[i].type == 'folder') {
                            return i;
                        }
                    }
                    return -1;
                }
                for (var i = 0; i < path.length; i++) {
                    var index = findInArray(currentDepth, path[i]);
                    if (index == -1) {
                        throw new Error("Path not found")
                    }
                    currentDepthID = currentDepth[index].id;
                    currentDepth = currentDepth[index].children;
                }
                //add to current depth
                currentDepth.push(appendedData);
                return currentDepthID;
            },
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
                currentFiles: [],
                currID: 0,
            }
    }

}

/*
//Test code
xx = new Sidebar()
xx.init(document.getElementById('sideMenu'))
xx.add('/','1','folder','html')
xx.add('/','index.js','file','html')
xx.add('/1/','2','folder','html')
xx.add('/1/','3','folder','html')
xx.add('/1/2/','3','folder','html')
xx.add('/1/2/3/','/1/2/3/','file','html')
xx.add('/1/2/3/','4','folder','html')
xx.add('/1/2/3/4/','5','folder','html')
xx.add('/1/2/3/4/5/','6','folder','html')
console.log(xx._data.currentFiles)
*/