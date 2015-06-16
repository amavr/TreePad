var folder = null;

function HomeFolder(callback) {

    var me = this;
    var HOME = 'TreePad';
    var folder = null;
    var root_id = null;

    function getFolderItems(options, callback) {
        var retrievePageOfChildren = function (request, result) {
            request.execute(function (resp) {
                result = result.concat(resp.items);
                var nextPageToken = resp.nextPageToken;
                if (nextPageToken) {
                    options.pageToken = nextPageToken;
                    request = gapi.client.drive.files.list(options);
                    retrievePageOfChildren(request, result);
                } else {
                    callback(result);
                }
            });
        }
        var initialRequest = gapi.client.drive.files.list(options);
        retrievePageOfChildren(initialRequest, []);
    }

    var findHomeFolder = function (callback) {
        var options = {
            'q': 'mimeType contains "application/vnd.google-apps.folder" and title = "' + HOME + '" and trashed = false and "'+ root_id +'" in parents',
            'fields': 'items(id,originalFilename,mimeType,modifiedDate,kind,title)',
            'pageToken': null
        }

        getFolderItems(options, function (result) {
            var folder = (result.length > 0) ? result[0] : null;
            callback(folder);
        });
    }

    var createHomeFolder = function (callback) {
        var body_request = {
            'title': HOME,
            'parents': [
                { 'id': root_id }
            ],
            'mimeType': 'application/vnd.google-apps.folder'
        };

        var request = gapi.client.drive.files.insert(body_request);
        request.execute(function (resp) {
            console.log(resp);
            callback(resp);
        });
    }

    var getRootFolder = function (callback) {
        var request = gapi.client.drive.about.get();
        request.execute(function (resp) {
            callback(resp.rootFolderId);
        });
    }

    this.getFiles = function (callback) {

        var options = {
            'q': '"' + folder.id + '" in parents and trashed = false',
            'fields': 'items(id,mimeType,fileExtension,downloadUrl,webViewLink,webContentLink,defaultOpenWithLink,selfLink,kind,fileSize,modifiedDate,title)',
            'pageToken': null
        }

        getFolderItems(options, function (files) {
            callback(files);
        });
    }

    var constructor = function (callback) {
        getRootFolder(function (rootId) {
            root_id = rootId;
            console.log(root_id);
            findHomeFolder(function (home_folder) {
                if (home_folder == null) {
                    createHomeFolder(function (home_folder) {
                        folder = home_folder;
                        callback();
                    });
                }
                else {
                    folder = home_folder;
                    callback();
                }
            });
        });
    }

    constructor(callback);
}

