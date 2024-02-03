/**
 * @class Sidebar
 * @description A class to handle the sidebar of the application
 */
class Sidebar {
    constructor() {
        this.init = function (el, FCM) {
            if (typeof el == "undefined") {
                throw new Error("No element provided")
            } else if (typeof el == 'object') {
                this._data.target = el;
                if (FCM == undefined) {
                    throw new Error("No fileContentManager provided")
                } else if (typeof FCM == 'object') {
                    if(FCM instanceof fileContentManager){
                    this._data.fileContentManager = fileContentManager;
                    }else{
                        throw new Error("FCM should be an instance of fileContentManager")
                    }
                } else {
                    throw new Error("fileContentManager is not an object")
                }
                //right click menu
                function handleRightClick(e) {
                    if (!(e.target.className == 'rename' || e.target.className == 'delete' || e.target.className == 'rightClick' || e.target.parentNode.className == 'delete' || e.target.parentNode.className == 'rename')) {
                        //check if clicking on top of right click menu
                        if (document.getElementsByClassName('rightClick').length != 0) {
                            document.getElementsByClassName('rightClick')[0].remove();
                        }
                    }
                }
                document.body.addEventListener('click', handleRightClick)
            } else {
                throw new Error("Element is not an object")
            }
        }
        this.add = function (path, name, type = 'folder', icon_name) {
            if (type == 'folder') {
                if (name.includes('/') || name.includes('.') || name.includes(' ')) {
                    throw new Error("Folder names can't contain / or . (Given Folder: " + name + ')')
                }
                //check if folder name already taken
                var div = document.createElement('div');
                div.className = "itemParent";
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
                div.children[0].addEventListener('click', function () {
                    var action = 'folderOpened'
                    if (div.className == "itemParent active") {
                        div.className = "itemParent";
                        //close all children infinite depth
                        function cleanUpChildren(parent) {
                            for (var i = 0; i < parent.children.length; i++) {
                                if (parent.children[i].className == "itemParent active") {
                                    parent.children[i].className = "itemParent";
                                    cleanUpChildren(parent.children[i].children[1]);
                                }
                            }
                        }
                        cleanUpChildren(div.children[1]);
                        action = 'folderClosed'
                    } else {
                        div.className = "itemParent active";
                    }
                    //calculate path
                    var currentCalculatedPath = [];
                    var parent = div;
                    while (parent.id != 'sideMenu') {
                        if (parent.className.includes('itemParent')) {
                            currentCalculatedPath.push(parent.children[0].children[1].innerHTML);
                        }
                        parent = parent.parentNode;
                    }
                    currentCalculatedPath.reverse();
                    //join path
                    currentCalculatedPath = '/' + currentCalculatedPath.join('/') + '/';
                    //dispatch event
                    this._data.target.dispatchEvent(new CustomEvent(action, { detail: { id: div.id, path: currentCalculatedPath } }));

                }.bind(this));
                this._rightClick(div.children[0]);
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
                    //check if file name already taken
                    for (var i = 0; i < this._data.currentFiles.length; i++) {
                        if (this._data.currentFiles[i].name == name && this._data.currentFiles[i].type == 'folder') {
                            throw new Error("Folder name already taken")
                        }
                    }
                    //add to base current files
                    this._data.currentFiles.push(fileData);
                    this._data.target.appendChild(div);
                } else {
                    //add to current depth
                    var id = this.handlePaths(path, fileData, 'folder');
                    //append to target
                    var parent = document.getElementById(id);
                    parent.children[1].appendChild(div);
                }
                //append to target
                return div.id;

            } else if (type == 'file') {
                if (name.includes('/') || name.includes(' ')) {
                    throw new Error("File names can't contain /")
                }
                var div = document.createElement('div');
                if (this._data.activeFile != null) {
                    this._data.activeFile.className = "item file";
                }
                div.className = "item file active";
                this._data.activeFile = div;
                div.id = 'sidebar' + this._data.currID;
                this._data.currID++
                var img = document.createElement('img');
                if (this._data.filesKnown.indexOf(icon_name) == -1) {
                    img.src = '/assets/text.svg';
                } else {
                    img.src = "/assets/" + this._data.fileIcons[icon_name];
                }
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
                //add right click menu
                this._rightClick(div);
                //add click action
                div.addEventListener('click', function () {
                    if (this._data.activeFile != null) {
                        this._data.activeFile.className = "item file";
                    }
                    div.className = "item file active";
                    this._data.activeFile = div;
                    //dispatch event
                    var computedPath = path.join('/') + '/' + name;
                    //if computed path doesn't start with / add it
                    if (computedPath[0] != '/') {
                        computedPath = '/' + computedPath;
                    }
                    this._data.target.dispatchEvent(new CustomEvent('fileOpened', { detail: { id: div.id, path: computedPath, name: name, icon_name: icon_name } }));
                }.bind(this));

                if (path.length == 0) {
                    //check if file name already taken
                    for (var i = 0; i < this._data.currentFiles.length; i++) {
                        if (this._data.currentFiles[i].name == name && this._data.currentFiles[i].type == 'file') {
                            throw new Error("File name already taken")
                        }
                    }
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
                //dispatch event
                this._data.target.dispatchEvent(new CustomEvent('fileAdded', { detail: { id: div.id } }));
                return div.id;

            } else {
                throw new Error("Unknown type (expected 'folder' or 'file') got " + type)
            }
        },
            this.renderAdd = function (path, type = 'folder') {
                //renders a temporary file with input (similar to rename function)
                //create new file with input
                if (type == 'folder') {
                    var div = document.createElement('div');
                    div.className = "itemParent";
                    div.id = 'tempCreationHandler';
                    div.innerHTML = `
                <div class="item folder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <input type="text" placeholder="New Folder">
                </div>
                    <div id="itemSubContent`+ div.id + `" class="itemSubContent">
                </div>`;
                    //add events
                    var input = div.children[0].children[1];
                    input.addEventListener('keydown', function (e) {
                        if (e.key == 'Enter') {
                            //check if any difference in name
                            if (input.value == '') {
                                div.remove();
                                return;
                            } else {
                                //createFile file
                                this.add(path, input.value, type);
                                //delete this
                                div.remove();
                            }
                        }
                    }.bind(this))
                    input.addEventListener('blur', function () {
                        //remove div
                        div.remove();
                    });
                    var pathSplit = this._handlePaths(path);
                    if (pathSplit.length == 0) {
                        this._data.target.appendChild(div);
                    } else {
                        var id = this.handlePaths(path, '', 'folder', false);
                        //append to target
                        var parent = document.getElementById(id);
                        parent.children[1].appendChild(div);
                    }
                    //focus input automatically
                    input.focus();
                } else if (type == 'file') {
                    var div = document.createElement('div');
                    div.className = "item file";
                    div.id = 'tempCreationHandler';
                    var img = document.createElement('img');
                    img.src = "/assets/text.svg";
                    div.appendChild(img);
                    var input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = "New File";
                    div.appendChild(input);
                    //add events
                    input.addEventListener('keyup', function (e) {
                        if (e.key == 'Enter') {
                            //check if any difference in name
                            if (input.value == '') {
                                div.remove();
                                return;
                            } else {
                                //createFile file
                                if (input.value.split('.')[1] == undefined) {
                                    throw new Error("File name must contain an extension")
                                }
                                var finalID = this.add(path, input.value, type, input.value.split('.')[1]);
                                //delete this
                                div.remove();
                                //dispatch fileOpened event
                                this._data.target.dispatchEvent(new CustomEvent('fileOpened', { detail: { path: path + input.value, name: input.value, icon_name: input.value.split('.')[1], id: finalID } }));
                            }
                        } else {
                            //change icon   
                            if (this._data.fileIcons[input.value.split('.')[1]] != undefined) {
                                img.src = "/assets/" + this._data.fileIcons[input.value.split('.')[1]];
                            } else {
                                img.src = "/assets/text.svg";
                            }
                        }
                    }.bind(this))
                    input.addEventListener('blur', function () {
                        //remove div
                        div.remove();
                    });
                    var pathSplit = this._handlePaths(path);
                    if (pathSplit.length == 0) {
                        this._data.target.appendChild(div);
                    } else {
                        var id = this.handlePaths(path, '', 'folder', false);
                        //append to target
                        var parent = document.getElementById(id);
                        parent.children[1].appendChild(div);
                    }
                    //focus input automatically
                    input.focus();

                } else {
                    throw new Error("Unknown type (expected 'folder' or 'file') got " + type)
                }
            },
            this._handlePaths = function (path) {
                return path.split('/').filter(element => element !== "");
            },
            this.handlePaths = function (path, appendedData, type = 'file', pushData = true) {
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
                        //create folder
                        this.add(path.slice(0, i).join('/'), path[i], 'folder');
                        index = findInArray(currentDepth, path[i]);
                    }
                    currentDepthID = currentDepth[index].id;
                    currentDepth = currentDepth[index].children;
                }
                //check if file name already taken
                for (var i = 0; i < currentDepth.length; i++) {
                    if (currentDepth[i].name == appendedData.name && ((currentDepth[i].type == 'file' && type == 'file') || (currentDepth[i].type == 'folder' && type == 'folder'))) {
                        throw new Error("File name already taken")
                    }
                }
                //add to current depth
                if (pushData) {
                    currentDepth.push(appendedData);
                }
                return currentDepthID;
            },
            this._rightClick = function (element) {
                element.addEventListener('contextmenu', function (e) {
                    //check if right click menu exists
                    if (document.getElementsByClassName('rightClick').length != 0) {
                        document.getElementsByClassName('rightClick')[0].remove();
                    }
                    var div = document.createElement('div');
                    div.className = "rightClick";
                    div.innerHTML = `<div class="rename"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-6 h-6" style="width: 15px;margin-right: 5px;">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125">
                            </path>
                        </svg>
                        <p style="margin: 0px;">Rename</p>
                    </div>
                    <div class="delete"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-6 h-6" style="width: 15px;">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0">
                            </path>
                        </svg>
                        <p>Delete</p>
                    </div>`;
                    div.children[0].addEventListener('click', function () {
                        //remove popup
                        div.remove();
                        //find parent and calculate path
                        var currentCalculatedPath = [];
                        var parent = element.parentNode;
                        while (parent.id != 'sideMenu') {
                            if (parent.className.includes('itemParent')) {
                                currentCalculatedPath.push(parent.children[0].children[1].innerHTML);
                            }
                            parent = parent.parentNode;
                        }
                        currentCalculatedPath.reverse();
                        //join path
                        currentCalculatedPath = currentCalculatedPath.join('/');
                        //check if file or folder
                        if (element.className.includes('file')) {
                            //add name to end of path
                            currentCalculatedPath += '/' + element.children[1].innerHTML;
                        } else {
                            currentCalculatedPath = '/' + currentCalculatedPath + '/';
                        }
                        //replace p with input
                        var input = document.createElement('input');
                        input.type = 'text';
                        input.value = element.children[1].innerHTML;
                        var oldText = input.value;
                        input.addEventListener('keydown', function (e) {
                            if (e.key == 'Enter') {
                                //check if any difference in name
                                if (input.value == oldText) {
                                    //remove input and add p
                                    element.children[1].outerHTML = '<p>' + input.value + '</p>';
                                    return;
                                } else {
                                    //rename file
                                    this.renameFile(currentCalculatedPath, input.value);
                                    //remove input and add p
                                    element.children[1].outerHTML = '<p>' + input.value + '</p>';
                                }
                            }
                        }.bind(this))
                        input.addEventListener('blur', function () {
                            //remove input and add p
                            element.children[1].outerHTML = '<p>' + oldText + '</p>';
                        });
                        element.children[1].remove();
                        element.insertBefore(input, element.children[1]);
                        input.focus();
                    }.bind(this));
                    div.children[1].addEventListener('click', function () {
                        //remove popup
                        div.remove();
                        //find parent and calculate path
                        var currentCalculatedPath = [];
                        var parent = element.parentNode;
                        while (parent.id != 'sideMenu') {
                            if (parent.className.includes('itemParent')) {
                                currentCalculatedPath.push(parent.children[0].children[1].innerHTML);
                            }
                            parent = parent.parentNode;
                        }
                        currentCalculatedPath.reverse();
                        //join path
                        currentCalculatedPath = currentCalculatedPath.join('/');
                        //check if file or folder
                        if (element.className.includes('file')) {
                            //add name to end of path
                            currentCalculatedPath += '/' + element.children[1].innerHTML;
                            this._data.target.dispatchEvent(new CustomEvent('fileDeleted', { detail: { path: currentCalculatedPath } }));
                        } else {
                            currentCalculatedPath = '/' + currentCalculatedPath + '/';
                            this._data.target.dispatchEvent(new CustomEvent('folderDeleted', { detail: { path: currentCalculatedPath } }));
                        }
                        //dispatch event
                        //remove file
                        this.deleteFile(currentCalculatedPath);
                    }.bind(this));
                    div.addEventListener('contextmenu', function (e) {
                        e.preventDefault();
                    });
                    div.style.left = e.clientX + 'px';
                    div.style.top = e.clientY + 'px';
                    //append to target
                    document.body.appendChild(div);

                    e.preventDefault()
                }.bind(this))
            },
            this.deleteFile = function (path) {
                //remove file name out of path
                if (typeof path == 'string') {
                    path = this._handlePaths(path);
                }
                var fileName = path.pop();
                //remove file from currentFiles
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
                var childNumber = -1;
                for (var i = 0; i < currentDepth.length; i++) {
                    if (currentDepth[i].name == fileName) {
                        currentDepth.splice(i, 1);
                        childNumber = i;
                    }
                }
                //remove from html
                var parent = document.getElementById(currentDepthID);
                if (path.length == 0) {
                    parent.children[childNumber].remove();
                } else {
                    parent.children[1].children[childNumber].remove();
                }
            },
            this.renameFile = function (path, newName) {
                if (newName.includes('/')) {
                    throw new Error("File names can't contain /")
                }
                //remove file name out of path
                if (typeof path == 'string') {
                    path = this._handlePaths(path);
                }
                var fileName = path.pop();
                //remove file from currentFiles
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
                //check if name is already taken
                for (var i = 0; i < currentDepth.length; i++) {
                    if (currentDepth[i].name == newName && ((currentDepth[i].type == 'file' && fileName.includes('.')) || (currentDepth[i].type == 'folder' && !fileName.includes('.')))) {
                        throw new Error("Name already taken")
                    }
                }
                var childNumber = -1;
                for (var i = 0; i < currentDepth.length; i++) {
                    if (currentDepth[i].name == fileName) {
                        currentDepth[i].name = newName;
                        childNumber = i;
                    }
                }
                //remove from html
                var parent = document.getElementById(currentDepthID);
                var actionName = 'file';
                if (path.length == 0) {
                    if (fileName.includes('.')) {
                        parent.children[childNumber].children[1].innerHTML = newName;
                        //change icon
                        if (this._data.fileIcons[newName.split('.')[1]] != undefined) {
                            parent.children[childNumber].children[0].src = "/assets/" + this._data.fileIcons[newName.split('.')[1]];
                        } else {
                            parent.children[childNumber].children[0].src = "/assets/text.svg";

                        }
                    } else {
                        actionName = 'folder';
                        parent.children[childNumber].children[0].children[1].innerHTML = newName;
                    }
                } else {
                    if (fileName.includes('.')) {
                        parent.children[1].children[childNumber].children[1].innerHTML = newName;
                    } else {
                        actionName = 'folder';
                        parent.children[1].children[childNumber].children[0].children[1].innerHTML = newName;
                    }
                }
                var oldPath = path.join('/') + '/' + fileName;
                if (oldPath[0] != '/') {
                    oldPath = '/' + oldPath;
                }
                var absPath = path.join('/') + '/' + newName;
                if (absPath[0] != '/') {
                    absPath = '/' + absPath;
                }
                this._data.target.dispatchEvent(new CustomEvent(actionName + 'Renamed', { detail: { id: childNumber, newName: newName, path: currentDepthID, absPath: absPath, oldName: fileName, oldPath: oldPath } }));
            },
            this.setActive = function (id) {
                //set active
                if (this._data.activeFile != null) {
                    this._data.activeFile.className = "item file";
                }
                var element = document.getElementById(id);
                if (element == null) {
                    return;
                }
                element.className = "item file active";
                this._data.activeFile = element;
                //open folder parents infinite depth
                var parent = element.parentNode;
                while (parent.id != 'sideMenu') {
                    if (parent.className.includes('itemParent')) {
                        if (!parent.className.includes('active')) {
                            parent.className = "itemParent active";
                        }
                    }
                    parent = parent.parentNode;
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
            currentFiles: [],
            currID: 0,
            activeFile: null,
            fileContentManager: null,
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