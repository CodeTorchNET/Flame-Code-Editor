var topMenuHandler = new TopBar();
topMenuHandler.init(document.getElementById("topMenu"));
var sidebarHandler = new Sidebar();
sidebarHandler.init(document.getElementById("sideMenu"));

var _data = {
    "currentCreatePath": "/",
}

document.getElementById("sideMenu").addEventListener('folderOpened', function (e) {
    _data.currentCreatePath = e.detail.path;
});
document.getElementById("sideMenu").addEventListener('folderClosed', function (e) {
    _data.currentCreatePath = '/';
});
document.getElementById('newFile').addEventListener('click', function () {
    sidebarHandler.renderAdd(_data.currentCreatePath,'file');
});
document.getElementById('newFolder').addEventListener('click', function () {
    sidebarHandler.renderAdd(_data.currentCreatePath);
});