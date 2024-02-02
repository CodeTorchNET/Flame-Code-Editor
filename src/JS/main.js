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
    //HANDLE AS THIS COULD BE A FOLDER WHICH MESSES UP THE PATH/HEIRARCHY
    console.log('HANDLE AS THIS COULD BE A FOLDER WHICH MESSES UP THE PATH/HEIRARCHY', e.detail);
});
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
document.getElementById('newFile').addEventListener('click', function () {
    sidebarHandler.renderAdd(_data.currentCreatePath, 'file');
});
document.getElementById('newFolder').addEventListener('click', function () {
    sidebarHandler.renderAdd(_data.currentCreatePath);
});