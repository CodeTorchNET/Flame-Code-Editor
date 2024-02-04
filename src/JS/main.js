//save files temporarily on edit even if Editor gets desposed

var topMenuHandler = new TopBar();
topMenuHandler.init(document.getElementById("topMenu"));
var sidebarHandler = new Sidebar();
var FCM = new fileContentManager();
FCM.init('1');
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
    "filesOpened": []
}

document.getElementById("sideMenu").addEventListener('folderOpened', function (e) {
    _data.currentCreatePath = e.detail.path;
});
document.getElementById("sideMenu").addEventListener('folderClosed', function (e) {
    _data.currentCreatePath = '/';
});
document.getElementById("sideMenu").addEventListener('fileRenamed', function (e) {
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
});
document.getElementById("sideMenu").addEventListener('folderRenamed', function (e) {
    //HANDLE AS THIS COULD BE A FOLDER WHICH MESSES UP THE PATH/HEIRARCHY
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
            element.path = element.path.replace(e.detail.oldPath, e.detail.absPath);
        }
    });
})
document.getElementById("sideMenu").addEventListener('fileOpened', function (e) {
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
    FCM.loadFile(e.detail.path).then(function (data) {
        editorHandler.renderFileEditor(data, editorHandler.languageEquivalent(e.detail.name.split('.').pop()));
    }).catch(function (error) {
        Toast.fire({
            icon: "error",
            title: "An error occured while trying to load the file: " + error
        });
    });
});
document.getElementById('topMenu').addEventListener('tabChanged', function (e) {
    console.log(e.detail)
    //find the path
    var Id = null;
    var path = null;
    _data.filesOpened.forEach(function (element) {
        if (element.topMenuId == e.detail.id) {
            Id = element.SidebarId;
            path = element.path;
        }
    });
    sidebarHandler.setActive(Id);
    FCM.loadFile(path).then(function (data) {
        editorHandler.renderFileEditor(data, editorHandler.languageEquivalent(path.split('.').pop()));
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
});
//NEEDS
document.getElementById('sideMenu').addEventListener('fileDeleted', function (e) {
    var Id = null;
    var index = null;
    _data.filesOpened.forEach(function (element, i) {
        if (element.path == e.detail.path) {
            Id = element.topMenuId;
            index = i;
        }
    });
    _data.filesOpened.splice(index, 1);
    topMenuHandler.remove(Id);
    editorHandler.renderWelcome();
    //FCM.deleteFile(e.detail.path);
});
//NEEDS
document.getElementById('sideMenu').addEventListener('folderDeleted', function (e) {
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
        topMenuHandler.remove(element);
    });
});

document.addEventListener('fileEdited', function (e) {
    topMenuHandler.changeState(topMenuHandler._data.activeElement,true);
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