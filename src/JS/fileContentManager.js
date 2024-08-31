/**
 * @class fileContentManager
 * @description This class tracks the creation of new files and the content of the files. It also handles the temporary saving of files.
 */
class fileContentManager {
    constructor() {
        this.init = function (projectID, APILoc = '/backend/') {
            if (typeof projectID == "undefined") {
                throw new Error("No remote provided")
            } else if (typeof projectID == 'string') {
                this._data.projectID = projectID;
                this._data.APILocation = APILoc;
                window.onbeforeunload = function () {
                    var temp = false;
                    for (var i = 0; i < this._data.offloadedFiles.length; i++) {
                        if (this._data.offloadedFiles[i].syncedWithRemote == false) {
                            temp = true;
                        }
                    }
                    if (temp) {
                        return "You have unsaved changes. Are you sure you want to leave?";
                    }
                }.bind(this);
            } else {
                throw new Error("Remote is not a string")
            }
        },
            this.loadFileStructure = function () {
                return new Promise((resolve, reject) => {
                    // Load the file structure from the remote
                    fetch(this._data.APILocation + 'loadProjectFileStructure.php?PID=' + this._data.projectID, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    }).then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to load file structure');
                        }
                    }).then(data => {
                        if (data.status == "false") {
                            reject(data.message);
                        } else {
                            resolve(data.files);
                        }
                    }).catch(error => {
                        console.error('Error:', error);
                        reject(error);
                    });
                });
            },
            this.loadFile = function (file) {
                if (file == '') {
                    file = '/';
                }
                for (var i = 0; i < this._data.offloadedFiles.length; i++) {
                    if (this._data.offloadedFiles[i].path == file) {
                        return new Promise((resolve, reject) => {
                            resolve({ "response": this._data.offloadedFiles[i].content, "MIME": this._data.offloadedFiles[i].MIME });
                        });
                    }
                }
                // Load the file from the remote
                return new Promise((resolve, reject) => {
                    fetch(this._data.APILocation + 'loadFile.php?PID=' + this._data.projectID + '&PATH=' + file, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    }).then(response => {
                        if (response.ok) {
                            return response.blob().then(blob => {
                                return { "response": blob, "MIME": response.headers.get('Content-Type') };
                            });
                        } else {
                            throw new Error('Failed to load file');
                        }
                    }).then(data => {
                        this._data.offloadedFiles.push({ path: file, _remoteFile: data.response, content: data.response, MIME: data.MIME, syncedWithRemote: true })
                        resolve(data);
                    }).catch(error => {
                        console.error('Error:', error);
                        reject(error);
                    });
                });
            },
            this.revertBackToRemote = function (file) {
                return new Promise((resolve, reject) => {
                    // Revert the file back to the remote
                    for (var i = 0; i < this._data.offloadedFiles.length; i++) {
                        if (this._data.offloadedFiles[i].path == file) {
                            this._data.offloadedFiles[i].content = this._data.offloadedFiles[i]._remoteFile;
                            this._data.offloadedFiles[i].syncedWithRemote = true;
                            resolve();
                        }
                    }
                    reject("File not found");
                });
            },
            this.renameFile = function (PATH, oldName, newName, type = 'file') {//file/folder
                // Rename the file on the remote
                return new Promise((resolve, reject) => {
                    if (typeof PATH == "undefined" || typeof oldName == "undefined" || typeof newName == "undefined") {
                        reject("Invalid parameters");
                    }
                    fetch(this._data.APILocation + 'renameFile.php?PID=' + this._data.projectID + '&PATH=' + PATH + '&ON=' + oldName + '&NN=' + newName, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    }).then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to rename file');
                            reject();
                        }
                    }).then(data => {
                        if (data.status == "false") {
                            reject(data.message);
                        } else {
                            if (type == 'file') {
                                for (var i = 0; i < this._data.offloadedFiles.length; i++) {
                                    if (this._data.offloadedFiles[i].path == PATH + oldName) {
                                        this._data.offloadedFiles[i].path = PATH + newName;
                                    }
                                }
                            }
                            resolve();
                        }
                    }).catch(error => {
                        console.error('Error:', error);
                    });
                });
            },
            this.deleteFile = function (file, type = 'file') {//file/folder
                // Delete the file from the remote
                return new Promise((resolve, reject) => {
                    if (typeof file == "undefined") {
                        reject("Invalid parameters");
                    }
                    if (file == '') {
                        reject("Invalid file");
                    }
                    fetch(this._data.APILocation + 'deleteFile.php?PID=' + this._data.projectID + '&PATH=' + file, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    }).then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to delete file');
                            reject();
                        }
                    }).then(data => {
                        if (data.status == "false") {
                            reject(data.message);
                        } else {
                            if (type == 'file') {
                                for (var i = 0; i < this._data.offloadedFiles.length; i++) {
                                    if (this._data.offloadedFiles[i].path == file) {
                                        this._data.offloadedFiles.splice(i, 1);
                                        resolve();
                                    }
                                }
                            }
                            resolve();
                        }
                    }).catch(error => {
                        console.error('Error:', error);
                    });
                });
            },
            this.createFile = function (path, name, type, content = "") {
                //create new file at remote

                return new Promise((resolve, reject) => {
                    if (typeof path == "undefined" || typeof name == "undefined" || typeof type == "undefined") {
                        reject("Invalid parameters");
                    }
                    if (type != "file" && type != "folder") {
                        reject("Invalid type");
                    }
                    fetch(this._data.APILocation + 'createFile.php?PID=' + this._data.projectID + '&path=' + path + '&name=' + name + '&type=' + type, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: content
                    }).then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to create file');
                            reject();
                        }
                    }).then(data => {
                        if (data.status == "false") {
                            reject(data.message);
                        } else {
                            if (content !== "" && type === "file") {
                                content = content.split(',')[1];
                                var decodedContent = atob(content);
                                var byteArray = new Uint8Array(decodedContent.length);
                                for (var i = 0; i < decodedContent.length; i++) {
                                    byteArray[i] = decodedContent.charCodeAt(i);
                                }
                                content = new Blob([byteArray], { type: data.mime });
                            } else {
                                content = new Blob([content], { type: data.mime });
                            }
                            if (type === "file") {
                                this._data.offloadedFiles.push({ path: path + name, content: content, MIME: data.mime, syncedWithRemote: true });
                            }
                            resolve();
                        }
                    }).catch(error => {
                        console.error('Error:', error);
                    });
                });
            },
            this.zipHandler = function (path) {
                return new Promise((resolve, reject) => {
                    //open zip link in new tab
                    window.open(this._data.APILocation + 'zipHandler.php?PID=' + this._data.projectID + '&path=' + path, '_blank');
                    resolve();
                });
            }
        this.saveFile = function (file, content) {
            // Save the file temporarily
            for (var i = 0; i < this._data.offloadedFiles.length; i++) {
                if (this._data.offloadedFiles[i].path == file) {
                    content = new Blob([content], { type: this._data.offloadedFiles[i].MIME });
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
                            fetch(this._data.APILocation + 'saveFile.php?PID=' + this._data.projectID + '&PATH=' + file, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'include',
                                body: this._data.offloadedFiles[i].content
                            }).then(response => {
                                if (response.ok) {
                                    return response.json();
                                } else {
                                    throw new Error('Failed to save file');
                                    reject();
                                }
                            }).then(data => {
                                if (data.status == "false") {
                                    reject(data.message);
                                } else {
                                    this._data.offloadedFiles[increment].syncedWithRemote = true;
                                    resolve();
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
                for (var x = 0; x < this._data.offloadedFiles.length; x++) {
                    if (this._data.offloadedFiles[x].path.startsWith(folderPath)) {
                        this._data.offloadedFiles[x].path = newName + this._data.offloadedFiles[x].path.substring(folderPath.length);
                    }
                }
            }
        this._data = {
            projectID: null,
            offloadedFiles: [],
            APILocation: '/backend/'
        }
    }
}