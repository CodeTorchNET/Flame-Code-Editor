var topMenuHandler = new TopBar();
topMenuHandler.init(document.getElementById("topMenu"));
var sidebarHandler = new Sidebar();
sidebarHandler.init(document.getElementById("sideMenu"));

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
        if(filePath == ''){
            filePath = '/';
        }
        if (filePath.startsWith(e.detail.oldPath)) {
            element.path = element.path.replace(e.detail.oldPath, e.detail.absPath);
        }
    });
    console.log(_data.filesOpened);
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
});
document.getElementById('topMenu').addEventListener('tabChanged',function(e){
    //find the path
    var Id = null;
    _data.filesOpened.forEach(function(element){
        if(element.topMenuId == e.detail.id){
            Id = element.SidebarId;
        }
    });
    sidebarHandler.setActive(Id);
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
});
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
document.getElementById('newFile').addEventListener('click', function () {
    sidebarHandler.renderAdd(_data.currentCreatePath, 'file');
});
document.getElementById('newFolder').addEventListener('click', function () {
    sidebarHandler.renderAdd(_data.currentCreatePath);
});