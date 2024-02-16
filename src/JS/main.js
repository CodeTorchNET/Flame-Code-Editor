// Bunch of variables so things work with CodeTorch
const runningInCodeTorch = document.location.href.includes('codetorch') || document.location.href.includes('https://localhost/');
const projectID = runningInCodeTorch ? location.pathname.split('/projects/')[1].split('/editor')[0].split('/fullscreen')[0].replaceAll('/', '') : window.location.search.replaceAll('?', '');
const APILocation = runningInCodeTorch ? '/projects/API/' : '/backend/';
const PreviewLocation = runningInCodeTorch ? '/projects/preview/' : '/projects/';
const terminalOverrideLocation = runningInCodeTorch ? '/projects/JS/terminal.js' : '/JS/terminal.js';

var currentTheme = 'dark';
var topMenuHandler = new TopBar();
topMenuHandler.init(document.getElementById("topMenu"));
var sidebarHandler = new Sidebar();
var FCM = new fileContentManager();
var PH = new PreviewHandler();
FCM.init(projectID,APILocation);
PH.init(document.getElementById("preview"), document.getElementById('terminal'), projectID,PreviewLocation,terminalOverrideLocation);
FCM.loadFileStructure().then(function (data) {
    sidebarHandler.init(document.getElementById("sideMenu"), FCM);
    for (var i = 0; i < data.length; i++) {
        if (data[i].TYPE == 'file') {
            sidebarHandler.add(data[i].PATH, data[i].FILENAME, data[i].TYPE, data[i].FILENAME.split('.').pop());
        } else {
            sidebarHandler.add(data[i].PATH, data[i].FILENAME, data[i].TYPE);
        }
    }
}).catch(function (error) {
    Toast.fire({
        icon: "error",
        title: "An error occured while trying to load the project: " + error
    });
});

document.getElementById('themeHandler').addEventListener('click', function () {
    if (currentTheme == 'dark') {
        document.getElementById('themeHandler').innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"></path>';
        document.body.classList.add('light');
        if(typeof monaco != 'undefined' && typeof monaco.editor != 'undefined' && typeof monaco.editor.setTheme != 'undefined'){
            monaco.editor.setTheme('');
        }
        currentTheme = 'light';
    } else {
        document.getElementById('themeHandler').innerHTML = '<path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clip-rule="evenodd"></path>';
        document.body.classList.remove('light');
        if(typeof monaco != 'undefined' && typeof monaco.editor != 'undefined' && typeof monaco.editor.setTheme != 'undefined'){
            monaco.editor.setTheme('vs-dark');
        }
        currentTheme = 'dark';
    }
});

document.getElementById('toptopMenuDownload').addEventListener('click', function () {
    Swal.fire({
        title: 'Download Project',
        text: 'Do you want to download the whole project? (this might take a while) (Just be patient, it will download)',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            FCM.zipHandler('/');
        }
    });
});

document.getElementById('toptopMenuShare').addEventListener('click', function () {
    Toast.fire({
        icon: "info",
        title: "This feature only exists at CodeTorch"
    });
});
document.getElementById('toptopMenuSettings').addEventListener('click', function () {
    Toast.fire({
        icon: "info",
        title: "This feature is not implemented yet"
    });
});

document.getElementById('seeProjectPage').addEventListener('click', function () {
    Toast.fire({
        icon: "info",
        title: "This feature only exists at CodeTorch"
    });
});

document.getElementById('saveNow').style.visibility = 'hidden';
document.getElementById('saveNow').addEventListener('click', function () {
    Toast.fire({
        icon: "info",
        title: "I am honestly too tired to implement this feature right now, if you want to save the file, just press Ctrl/CMD + S",
        text: "Or help me implement it by contributing to the project"
    });
});

function checkType(MIME) {
    OG = MIME;
    MIME = MIME.split(';')[0];
    MIME = MIME.split('/')[0];
    if (MIME == 'image') {
        return 'image';
    } else if (MIME == 'text') {
        return 'code';
    } else if (MIME == 'application') {
        if (OG == 'application/octet-stream') {
            return 'unknown';
        } else {
            return 'code';
        }
    } else if (MIME == 'video' || MIME == 'audio') {
        if (OG == 'video/quicktime') {
            return 'unknown'
        }
        return 'video';
    } else {
        return 'unknown';
    }
}

var editorHandler = new Editor();
editorHandler.init(document.getElementById("mainContent"));

document.addEventListener('keydown', function (event) {
    // Check if Ctrl (or Cmd) key is pressed and the key is 'S'
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        // Prevent the default browser save action
        event.preventDefault();
        if (_data.currentOpenedFile != null) {
            FCM.pushFileToRemote(_data.currentOpenedFile).then(function () {
                topMenuHandler.changeState(topMenuHandler._data.activeElement, false);
                PH.reload();
                Toast.fire({
                    icon: "success",
                    title: "File saved"
                });
            }.bind(this)).catch(function (error) {
                Toast.fire({
                    icon: "error",
                    title: "An error occured while trying to save the file."
                });
            });
        }
    }
});

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

window.onerror = function (message, source, lineno, colno, error) {
    Toast.fire({
        icon: "error",
        title: "An error occured: " + message
    });
};

var _data = {
    "currentCreatePath": "/",
    "filesOpened": [],
    'currentOpenedFile': null
}

document.getElementById("sideMenu").addEventListener('folderOpened', function (e) {
    _data.currentCreatePath = e.detail.path;
});
document.getElementById("sideMenu").addEventListener('folderClosed', function (e) {
    _data.currentCreatePath = '/';
});
document.getElementById("sideMenu").addEventListener('fileRenamed', function (e) {
    //path is equal to e.detail.oldPath substringed by the length of the old name (so only the path remains)
    var path = e.detail.oldPath.substring(0, e.detail.oldPath.length - e.detail.oldName.length);
    FCM.renameFile(path, e.detail.oldName, e.detail.newName).then(function () {
        PH.reload();
        Toast.fire({
            icon: "success",
            title: "File renamed"
        });
        //check if it is open if so rename it
        _data.filesOpened.forEach(function (element) {
            if (element.path == e.detail.oldPath) {
                topMenuHandler.rename(element.topMenuId, e.detail.newName);
            }
        });
        //rename element in _data
        _data.filesOpened.forEach(function (element) {
            if (element.path == e.detail.oldPath) {
                element.name = e.detail.newName;
                element.path = e.detail.absPath;
                if (_data.currentOpenedFile == e.detail.oldPath) {
                    _data.currentOpenedFile = e.detail.absPath;
                }
            }
        });
    }).catch(function (error) {
        Toast.fire({
            icon: "error",
            title: "An error occured while trying to rename the file/folder: " + error
        });
    })
});
document.getElementById("sideMenu").addEventListener('folderRenamed', function (e) {
    //HANDLE AS THIS COULD BE A FOLDER WHICH MESSES UP THE PATH/HEIRARCHY
    var path = e.detail.oldPath.substring(0, e.detail.oldPath.length - e.detail.oldName.length);
    FCM.renameFile(path, e.detail.oldName, e.detail.newName, 'folder').then(function () {
        _data.currentCreatePath = '/';
        Toast.fire({
            icon: "success",
            title: "File renamed"
        });
        //check if it all files are underneath renamed folder
        _data.filesOpened.forEach(function (element) {
            //check if it starts with the old path
            filePath = element.path.split('/');
            filePath.pop();
            filePath = filePath.join('/');
            if (filePath == '') {
                filePath = '/';
            }
            if (filePath.startsWith(e.detail.oldPath)) {
                element.path = e.detail.absPath + element.path.substring(e.detail.oldPath.length);
            }
        });
    }).catch(function (error) {
        Toast.fire({
            icon: "error",
            title: "An error occured while trying to rename the folder: " + error
        });
    });
})
document.getElementById("sideMenu").addEventListener('fileOpened', function (e) {
    _data.currentOpenedFile = e.detail.path;
    FCM.loadFile(e.detail.path).then(function (data) {
        var type = checkType(data.MIME);
        if (type == 'image') {
            editorHandler.renderImageEditor(data.response, data.MIME);
        } else if (type == 'code') {
            editorHandler.renderFileEditor(data.response, editorHandler.languageEquivalent(e.detail.name.split('.').pop()));
        } else if (type == 'video') {
            editorHandler.renderVideoEditor(data.response, e.detail.name);
        } else if (type == 'unknown') {
            editorHandler.renderError(true, data.response, e.detail.name);
        } else {
            editorHandler.renderError(true, data.response, e.detail.name);
        }
        //open it in top bar
        //check if it is already opened
        var alreadyOpened = false;
        var topMenuId = null;
        _data.filesOpened.forEach(function (element) {
            if (element.path == e.detail.path) {
                alreadyOpened = true;
                topMenuId = element.topMenuId;
            }
        });
        if (alreadyOpened) {
            topMenuHandler.setActive(topMenuId, true);
        } else {
            const topMenuId = topMenuHandler.add(e.detail.name, e.detail.icon_name, false)
            _data.filesOpened.push({
                name: e.detail.name,
                path: e.detail.path,
                icon_name: e.detail.icon_name,
                topMenuId: topMenuId,
                SidebarId: e.detail.id
            });
            //set active
            topMenuHandler.setActive(topMenuId, true);
        }
    }).catch(function (error) {
        Toast.fire({
            icon: "error",
            title: "An error occured while trying to load the file: " + error
        });
    });
});
document.getElementById('topMenu').addEventListener('tabChanged', function (e) {
    //find the path
    var Id = null;
    var path = null;
    _data.filesOpened.forEach(function (element) {
        if (element.topMenuId == e.detail.id) {
            Id = element.SidebarId;
            path = element.path;
        }
    });
    FCM.loadFile(path).then(function (data) {
        var type = checkType(data.MIME);
        if (type == 'image') {
            editorHandler.renderImageEditor(data.response, data.MIME);
        } else if (type == 'code') {
            editorHandler.renderFileEditor(data.response, editorHandler.languageEquivalent(path.split('.').pop()));
        } else if (type == 'video') {
            editorHandler.renderVideoEditor(data.response, path.split('/').pop());
        } else if (type == 'unknown') {
            editorHandler.renderError(true, data.response, path.split('/').pop());
        } else {
            editorHandler.renderError(true, data.response, path.split('/').pop());
        }
        sidebarHandler.setActive(Id);
        _data.currentOpenedFile = path;
    }).catch(function (error) {
        Toast.fire({
            icon: "error",
            title: "An error occured while trying to load the file: " + error
        });
    });
})
document.getElementById('topMenu').addEventListener('tabClosed', function (e) {
    var Id = null;
    var index = null;
    _data.filesOpened.forEach(function (element, i) {
        if (element.topMenuId == e.detail.id) {
            Id = element.SidebarId;
            index = i;
        }
    });
    _data.filesOpened.splice(index, 1);
    _data.currentOpenedFile = null;
    editorHandler.renderWelcome();
});
document.getElementById('sideMenu').addEventListener('fileDeleted', function (e) {
    FCM.deleteFile(e.detail.path).then(function () {
        PH.reload()
        _data.currentCreatePath = '/';
        var Id = null;
        var index = null;
        _data.filesOpened.forEach(function (element, i) {
            if (element.path == e.detail.path) {
                Id = element.topMenuId;
                index = i;
            }
        });
        _data.filesOpened.splice(index, 1);
        if (Id != null) {
            topMenuHandler.remove(Id);
            _data.currentOpenedFile = null;
            editorHandler.renderWelcome();
        }
    }).catch(function (error) {
        Toast.fire({
            icon: "error",
            title: "An error occured while trying to delete the file: " + error
        });
    });
});
document.getElementById('topMenu').addEventListener('tabClosed', function (e) {
    console.log(e.detail);
});

//NEEDS
document.getElementById('sideMenu').addEventListener('folderDeleted', function (e) {
    FCM.deleteFile(e.detail.path, 'folder').then(function () {
        PH.reload();
        _data.currentCreatePath = '/';
        //check every file and remove the ones that are in the folder
        var toRemove = [];
        _data.filesOpened.forEach(function (element, i) {
            if (element.path.includes(e.detail.path)) {
                toRemove.push(element.topMenuId);
            }
        });
        //remove from _data
        _data.filesOpened = _data.filesOpened.filter(function (element) {
            return !element.path.includes(e.detail.path);
        });
        toRemove.forEach(function (element) {
            if (document.getElementById(element).className.includes('active')) {
                //close the editor
                _data.currentOpenedFile = null;
                editorHandler.renderWelcome();
            }
            topMenuHandler.remove(element);
        });
        if (e.detail.path[e.detail.path.length - 1] == '/') {
            e.detail.path = e.detail.path.substring(0, e.detail.path.length - 1);
        }
    }).catch(function (error) {
        Toast.fire({
            icon: "error",
            title: "An error occured while trying to delete the folder: " + error
        });
    });
    //Close files and editor if you need to, + send remote delete
});

document.addEventListener('fileEdited', function (e) {
    topMenuHandler.changeState(topMenuHandler._data.activeElement, true);
    document.getElementById('saveNow').style.visibility = '';
    var currentOpenedPath = null;
    _data.filesOpened.forEach(function (element) {
        if (element.topMenuId == topMenuHandler._data.activeElement) {
            currentOpenedPath = element.path;
        }
    });
    FCM.saveFile(currentOpenedPath, editorHandler.getFileContent());
});
document.getElementById('newFile').addEventListener('click', function () {
    try {
        sidebarHandler.renderAdd(_data.currentCreatePath, 'file');
    } catch (e) {
        console.log(e);
    }
});
document.getElementById('sideMenu').addEventListener('fileAdded', function (e) {
    Path = '/' + e.detail.path.join('/');
    if (Path[Path.length - 1] != '/') {
        Path += '/';
    }
    FCM.createFile(Path, e.detail.name, e.detail.type).then(function () {
        if (e.detail.type == 'file') {
            PH.reload();
            const topMenuId = topMenuHandler.add(e.detail.name, e.detail.type, false);
            _data.filesOpened.push({
                name: e.detail.name,
                path: Path + e.detail.name,
                icon_name: e.detail.icon_name,
                topMenuId: topMenuId,
                SidebarId: e.detail.id
            });
            //set active
            topMenuHandler.setActive(topMenuId, true);
            _data.currentOpenedFile = ('/' + e.detail.path.join('/') + '/' + e.detail.name).replaceAll('//', '/');
            FCM.loadFile(Path + e.detail.name).then(function (data) {
                var type = checkType(data.MIME);
                if (type == 'image') {
                    editorHandler.renderImageEditor(data.response, data.MIME);
                } else if (type == 'code') {
                    editorHandler.renderFileEditor(data.response, editorHandler.languageEquivalent(e.detail.name.split('.').pop()));
                } else if (type == 'video') {
                    editorHandler.renderVideoEditor(data.response, e.detail.name);
                } else if (type == 'unknown') {
                    editorHandler.renderError(true, data.response, e.detail.name);
                } else {
                    editorHandler.renderError(true, data.response, e.detail.name);
                }
            }).catch(function (error) {
                Toast.fire({
                    icon: "error",
                    title: "An error occured while trying to load the file: " + error
                });
            });
        }
    }).catch(function (error) {
        console.log('failed', error)
        Toast.fire({
            icon: "error",
            title: "An error occured while trying to create the File/Folder: " + error
        });
    });
});
document.getElementById('newFolder').addEventListener('click', function () {
    sidebarHandler.renderAdd(_data.currentCreatePath);
});

/*
document.getElementsByClassName('sideMenu')[0].style.minHeight = window.innerHeight + 'px';
//on resize
document.body.onresize = function () {
    document.getElementsByClassName('sideMenu')[0].style.minHeight = window.innerHeight + 'px';
}
*/
var dragging = false;

$('#sideMenuResize').mousedown(function (e) {
    e.preventDefault();
    document.getElementById('preview').style.pointerEvents = 'none';

    dragging = true;
    var sidebar = $('.sideMenu');
    var ghostbar = $('<div>', {
        id: 'ghostbar',
        css: {
            height: sidebar.outerHeight(),
            top: sidebar.offset().top,
            left: sidebar.offset().left
        }
    }).appendTo('body');

    $(document).mousemove(function (e) {
        ghostbar.css("left", e.pageX + 2);
    });
});

$(document).mouseup(function (e) {
    if (dragging) {
        $('.sideMenu').css("width", e.pageX - 34);
        $('#mainContent').css('max-width', parseInt(window.getComputedStyle(document.body).getPropertyValue('width')) - (e.pageX + (parseInt(window.getComputedStyle(document.getElementsByClassName('MainRightThird')[0]).getPropertyValue('width')) + 3)));

        $('.MainRightThirdParent').css("min-width", (window.innerWidth - (e.pageX + (parseInt(window.getComputedStyle(document.body).getPropertyValue('width')) - (e.pageX + (parseInt(window.getComputedStyle(document.getElementsByClassName('MainRightThird')[0]).getPropertyValue('width'))))))));
        $('.MainRightThirdParent').css("max-width", (window.innerWidth - (e.pageX + (parseInt(window.getComputedStyle(document.body).getPropertyValue('width')) - (e.pageX + (parseInt(window.getComputedStyle(document.getElementsByClassName('MainRightThird')[0]).getPropertyValue('width'))))))));

        $('#ghostbar').remove();
        $(document).unbind('mousemove');
        dragging = false;
        document.getElementById('preview').style.pointerEvents = '';
    }
});


var draggingRight = false;

$('#RightSideResize').mousedown(function (e) {
    e.preventDefault();
    document.getElementById('preview').style.pointerEvents = 'none';
    draggingRight = true;
    var sidebar = $('.MainRightThirdParent');
    var ghostbar = $('<div>', {
        id: 'ghostbar',
        css: {
            height: sidebar.outerHeight(),
            top: sidebar.offset().top,
            left: sidebar.offset().left
        }
    }).appendTo('body');

    $(document).mousemove(function (e) {
        ghostbar.css("left", e.pageX + 2);
    });
});

$(document).mouseup(function (e) {
    if (draggingRight) {
        $('.MainRightThirdParent').css("min-width", (window.innerWidth - e.pageX));
        $('.MainRightThirdParent').css("max-width", (window.innerWidth - e.pageX));
        $('#mainContent').css('max-width', parseInt(window.getComputedStyle(document.body).getPropertyValue('width')) - ((window.innerWidth - e.pageX) + (parseInt(window.getComputedStyle(document.getElementsByClassName('sideMenu')[0]).getPropertyValue('width')) + 40)));
        $('#ghostbar').remove();
        $(document).unbind('mousemove');
        draggingRight = false;
        document.getElementById('preview').style.pointerEvents = '';
    }
});


var draggingBottom = false;

$('#TopSideResize').mousedown(function (e) {
    e.preventDefault();
    document.getElementById('preview').style.pointerEvents = 'none';
    draggingBottom = true;
    var content = $('.previewParent');
    var ghostbar = $('<div>', {
        id: 'ghostbar',
        css: {
            width: content.outerWidth(),
            height: 5,
            top: content.offset().top,
            left: content.offset().left
        }
    }).appendTo('body');

    $(document).mousemove(function (e) {
        ghostbar.css("top", e.pageY + 2);
    });
});

$(document).mouseup(function (e) {
    if (draggingBottom) {
        $('.previewParent').css("height", e.pageY - 40);
        $('.terminal').css("height", 'calc(100% - ' + (e.pageY + 47) + 'px)');
        $('#ghostbar').remove();
        $(document).unbind('mousemove');
        draggingBottom = false;
        document.getElementById('preview').style.pointerEvents = '';
    }
});



function uploadFolder(overrideFolderCreation = false) {
    function internal() {
        return new Promise((resolve, reject) => {
            var UploadinputEl = '';
            if (overrideFolderCreation) {
                UploadinputEl = document.getElementById('fileInput');
            } else {
                UploadinputEl = document.getElementById('folderInput');
            }
            const files = UploadinputEl.files;
            var newFoldersToCreate = []; // Declare outside of the loop
            var filesEnd = [];
            if (files.length === 0) {
                console.log('No files selected.');
                return;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileName = file.webkitRelativePath || file.name;
                // Check if the file name starts with a dot
                if (fileName.split('/').pop().startsWith('.')) {
                    console.log('Skipping hidden file:', fileName);
                    continue;
                }

                const reader = new FileReader();

                reader.onload = function (event) {
                    const content = event.target.result;
                    filesEnd.push({ fileName, content });
                    if (!newFoldersToCreate.includes(fileName.split('/').slice(0, -1).join('/'))) {
                        newFoldersToCreate.push(fileName.split('/').slice(0, -1).join('/'));
                    }
                    if (i === files.length - 1) {
                        resolve({ newFoldersToCreate, filesEnd });
                    }
                };

                reader.readAsDataURL(file);
            }
        });
    }
    internal().then((e) => {
        newFoldersToCreate = e.newFoldersToCreate;
        filesEnd = e.filesEnd;
        //create the folders
        function intneralFileUploader() {
            function internalFileUploader(element, index, array) {
                path = '';
                fileName = '';
                if (!element.fileName.includes('/')) {
                    fileName = element.fileName;
                } else {
                    path = element.fileName.split('/');
                    fileName = path.pop();
                    path = path.join('/');
                    path = path + '/';
                }
                var finalPath = _data.currentCreatePath + path;
                if (overrideFolderCreation) {
                    finalPath = _data.currentCreatePath;
                }
                FCM.createFile(finalPath, fileName, 'file', element.content)
                    .then(function () {
                        sidebarHandler.add(finalPath, fileName, 'file');
                        Toast.fire({
                            icon: "success",
                            title: "Uploaded " + (index + 1) + " of " + (array.length) + ' files',
                        });
                        if (index === array.length - 1) {
                            //done creating files
                            return;
                        } else {
                            internalFileUploader(array[index + 1], index + 1, array);
                        }
                    })
                    .catch(function (error) {
                        console.log('Error creating file:', element.fileName, error);
                        Toast.fire({
                            icon: "error",
                            title: "An error occured while trying to upload the file " + element.fileName + ": " + error
                        });
                    })
            }
            internalFileUploader(filesEnd[0], 0, filesEnd);
        }
        function internalFolderCreator(element, index, array) {
            //CHECK IF BASE FOLDER ALREADY EXISTS
            path = '';
            fileName = '';
            if (!element.includes('/')) {
                fileName = element;
            } else {
                path = element.split('/');
                fileName = path.pop();
                path = path.join('/');
                path = path + '/';
            }
            FCM.createFile(_data.currentCreatePath + path, fileName, 'folder')
                .then(function () {
                    sidebarHandler.add(_data.currentCreatePath + path, fileName, 'folder');
                    Toast.fire({
                        icon: "success",
                        title: "Completed " + (index + 1) + " of " + array.length + ' preperations',
                    });
                    if (index === array.length - 1) {
                        //done creating folders
                        intneralFileUploader();
                    } else {
                        internalFolderCreator(array[index + 1], index + 1, array);
                    }
                })
                .catch(function (error) {
                    console.log('Error creating folder:', path, error);
                    Toast.fire({
                        icon: "error",
                        title: "An error occured while trying to upload the folder: " + error
                    });
                })
        }
        if (overrideFolderCreation) {
            intneralFileUploader();
        } else {
            internalFolderCreator(newFoldersToCreate[0], 0, newFoldersToCreate);
        }
    });
}

document.getElementById('reload').addEventListener('click', function () {
    PH.reload();
});

document.getElementById('fullscreen').addEventListener('click', function () {
    //check if already fullscreen
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        var elem = document.getElementsByClassName('previewParent')[0];
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
    }
});