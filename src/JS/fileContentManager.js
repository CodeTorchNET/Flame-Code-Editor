/**
 * @class fileContentManager
 * @description This class tracks the creation of new files and the content of the files. It also handles the temporary saving of files.
 */
class fileContentManager {
    constructor() {
        this.init = function (projectID) {
            if (typeof projectID == "undefined") {
                throw new Error("No remote provided")
            } else if (typeof projectID == 'string') {
                this._data.projectID = projectID;
            } else {
                throw new Error("Remote is not a string")
            }
        },
            this.loadFileStructure = function () {
                return new Promise((resolve, reject) => {
                    // Load the file structure from the remote
                    fetch('/backend/loadProjectFileStructure.php?PID='+this._data.projectID, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to load file structure');
                        }
                    }).then(data => {
                        if(data.status == "error"){
                            reject(data.message);
                        }else{
                        resolve(data.files);
                        }
                    }).catch(error => {
                        console.error('Error:', error);
                        reject(error);
                    });
                });
            },
            this.loadFile = function (file) {
                for (var i = 0; i < this._data.offloadedFiles.length; i++) {
                    if (this._data.offloadedFiles[i].path == file) {
                        return new Promise((resolve, reject) => {
                            resolve(this._data.offloadedFiles[i].content)
                        });
                    }
                }
                // Load the file from the remote
                return new Promise((resolve, reject) => {
                    fetch('/backend/loadFile.php?PID='+this._data.projectID+'&PATH='+file, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(response => {
                        if (response.ok) {
                            return response.text();
                        } else {
                            throw new Error('Failed to load file');
                        }
                    }).then(data => {
                        this._data.offloadedFiles.push({path: file, content: data, syncedWithRemote: true})
                        resolve(data);
                    }).catch(error => {
                        console.error('Error:', error);
                        reject(error);
                    });
                });
            },
            this.renameFile = function (file) {//file/folder
                // Rename the file on the remote
            },
            this.deleteFile = function (file) {//file/folder
                // Delete the file from the remote
            },
            this.saveFile = function (file,content) {
                // Save the file temporarily
                for (var i = 0; i < this._data.offloadedFiles.length; i++) {
                    if (this._data.offloadedFiles[i].path == file) {
                        this._data.offloadedFiles[i].content = content;
                        this._data.offloadedFiles[i].syncedWithRemote = false;
                        return;
                    }
                }
            },
            this.pushFileToRemote = function (file) {
                // Push the file to the remote
                return new Promise((resolve, reject) => {
                for (var i = 0; i < this._data.offloadedFiles.length; i++) {
                    if (this._data.offloadedFiles[i].path == file) {
                        const increment = i;
                        fetch('/backend/saveFile.php?PID='+this._data.projectID+'&PATH='+file, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: this._data.offloadedFiles[i].content
                        }).then(response => {
                            if (response.ok) {
                                this._data.offloadedFiles[increment].syncedWithRemote = true;
                                resolve();
                            } else {
                                throw new Error('Failed to save file');
                                reject();
                            }
                        }).catch(error => {
                            console.error('Error:', error);
                        });
                    }
                }
            });
            },
            this.folderRename = function (folderPath, newName) {
                // Rename all offloaded files that are in the folder
                for(var x = 0; x < this._data.offloadedFiles.length; x++){
                    if(this._data.offloadedFiles[x].path.startsWith(folderPath)){
                        this._data.offloadedFiles[x].path = newName + this._data.offloadedFiles[x].path.substring(folderPath.length);
                    }
                }
            }
            this._data = {
                projectID: null,
                offloadedFiles: [],
            }
    }
}