//save files temporarily on edit even if Editor gets desposed

var topMenuHandler = new TopBar();
topMenuHandler.init(document.getElementById("topMenu"));
var sidebarHandler = new Sidebar();
var FCM = new fileContentManager();
var PH = new PreviewHandler();
FCM.init('1');
PH.init(document.getElementById("preview"),document.getElementById('terminal'), '1');
FCM.loadFileStructure().then(function (data) {
    sidebarHandler.init(document.getElementById("sideMenu"), FCM);
    for (var i = 0; i < data.length; i++) {
        sidebarHandler.add(data[i].PATH, data[i].FILENAME, data[i].TYPE);
    }
}).catch(function (error) {
    Toast.fire({
        icon: "error",
        title: "An error occured while trying to load the project: " + error
    });
});
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
        editorHandler.renderFileEditor(data, editorHandler.languageEquivalent(e.detail.name.split('.').pop()));
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
        editorHandler.renderFileEditor(data, editorHandler.languageEquivalent(path.split('.').pop()));
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
    FCM.deleteFile(e.detail.path).then(function () {
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
            _data.currentOpenedFile = e.detail.path;
            FCM.loadFile(Path + e.detail.name).then(function (data) {
                editorHandler.renderFileEditor(data, editorHandler.languageEquivalent(e.detail.name.split('.').pop()));
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
        $('.sideMenu').css("width", e.pageX - 40);
        $('#ghostbar').remove();
        $(document).unbind('mousemove');
        dragging = false;
    }
});