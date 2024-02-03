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
            // Load the file structure from the remote
        },
        this.loadFile = function (file) {
            // Load the file from the remote
        },
        this.renameFile = function (file) {//file/folder
            // Rename the file on the remote
        },
        this.deleteFile = function (file) {//file/folder
            // Delete the file from the remote
        },
        this.saveFile = function (file) {
            // Save the file to the remote
        },
            this._data = {
                projectID: null
            }
    }
}