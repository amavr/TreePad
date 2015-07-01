var folder = null;

function HomeFolder(callback) {

    var me = this;
    var HOME = 'TreePad';
    this.props = null;
    var root_id = null;

    var $body = $("body");

    var showWait = function (bool) {
        if (bool) {
            $body.addClass("loading");
        }
        else {
            $body.removeClass("loading");
        }
    }

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

    this.logout = function (accessToken, callback) {
        var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + accessToken;

        // Perform an asynchronous GET request.
        $.ajax({
            type: 'GET',
            url: revokeUrl,
            async: false,
            contentType: "application/json",
            dataType: 'jsonp',
            success: function (nullResponse) {
                if (callback) callback(true, null);
            },
            error: function (e) {
                if (callback) callback(false, e);
            }
        });
    }


    this.getFiles = function (callback) {

        var options = {
            'q': '"' + me.props.id + '" in parents and trashed = false',
            'fields': 'items(id,mimeType,fileExtension,downloadUrl,webViewLink,webContentLink,defaultOpenWithLink,selfLink,kind,fileSize,modifiedDate,title)',
            'pageToken': null
        }

        getFolderItems(options, function (files) {
            callback(files);
        });
    }

    this.addFile = function (fileData, title, id, callback) {
        showWait(true);

        var boundary = '-------314159265358979323846';
        var delimiter = "\r\n--" + boundary + "\r\n";
        var close_delim = "\r\n--" + boundary + "--";

        var reader = new FileReader();
        reader.readAsBinaryString(fileData);
        reader.onload = function (e) {
            var contentType = fileData.type || 'application/octet-stream';
            var metadata = {
                'title': title,
                'mimeType': contentType,
                'parents': [
                    { 'id': me.props.id }
                ],
            };

            var base64Data = btoa(reader.result);
            var multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                base64Data +
                close_delim;

            var rest_id = (id == null) ? '' : '/' + id;
            var method = (id == null) ? 'POST' : 'PUT';

            var request = gapi.client.request({
                'path': '/upload/drive/v2/files' + rest_id,
                'method': method,
                'params': { 'uploadType': 'multipart' },
                'headers': { 'Content-Type': 'multipart/mixed; boundary="' + boundary + '"', 'Authorization': 'Bearer ' + Settings.AccessToken },
                'body': multipartRequestBody
            });

            if (!callback) {
                callback = function (file) {
                    console.log(file)
                };
            }
            request.execute(function (file) {
                file_id = file.id;
                showWait(false);
                callback(file);
            });
        }
    }

    var constructor = function (callback) {
        getRootFolder(function (rootId) {
            root_id = rootId;
            // console.log(root_id);
            findHomeFolder(function (home_folder) {
                if (home_folder == null) {
                    createHomeFolder(function (home_folder) {
                        me.props = home_folder;
                        callback();
                    });
                }
                else {
                    me.props = home_folder;
                    callback();
                }
                console.log(me.props);
            });
        });
    }

    constructor(callback);
}

