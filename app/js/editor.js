function Editor(FileID, HomeFolderId) {

    var me = this;
    var file_id = FileID;
    var folder_id = HomeFolderId;
    var tree = null; 
    this.title = '';

    var $body = $("body");

    var showWait = function(bool) {
        if (bool) {
            $body.addClass("loading");
        }
        else {
            $body.removeClass("loading");
        }
    }


    var downloadFile = function (callback) {
        showWait(true);
        var request = gapi.client.request({
            'path': '/drive/v2/files/' + file_id,
            'headers': { 'Authorization': 'Bearer ' + Settings.AccessToken },
            'method': 'GET',
            'params': { "fields": "downloadUrl,title,parents(id,parentLink)" }
        });

        request.execute(function (res) {
            if (res && !res.error) {
                var file = res;
                if (file.downloadUrl) {
                    me.title = file.title;
                    document.title = me.title;
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', file.downloadUrl);
                    xhr.setRequestHeader('Authorization', 'Bearer ' + Settings.AccessToken);
                    xhr.onload = function () {
                        showWait(false);
                        callback(true, xhr.responseText);
                    };
                    xhr.onerror = function () {
                        showWait(false);
                        callback(false, null);
                    };
                    xhr.send();
                } else {
                    showWait(false);
                    callback(false, null);
                }
            }
            else {
                callback(false, res.error);
            }
        });
    }

    var uploadFile = function (fileData, title, id, callback) {
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
                    { 'id': folder_id }
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
                'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"', 'Authorization': 'Bearer ' + Settings.AccessToken},
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

    var  initHandlers = function() {
    
            $('#btn-up').bind('click', function () {
                tree.up();
            });
    
            $('#btn-down').bind('click', function () {
                tree.down();
            });
    
            $('#btn-add').bind('click', function () {
                tree.add({ title: 'new node', text: '' });
            });
    
            $('#btn-del').bind('click', function () {
                tree.delete();
            });
    }

    this.load = function (callback) {
        downloadFile(function(success, answer){
            if (success) {
                var data = JSON.parse(answer);
                // console.log(nodes);
                tree = new Tree('#tree-box', data);
                initHandlers();
            }
            callback(success, answer);
        });
    }

    this.save = function (data, callback) {
        // uploadFile(data, callback);
        var text = JSON.stringify(data);
        var blob = new Blob([text], { type: 'application/json' });
        uploadFile(blob, me.title, file_id, callback);
    }

    this.saveas = function (data, title, callback) {
        var text = JSON.stringify(data);
        var blob = new Blob([text], { type: 'application/json' });
        var new_id = (title === me.title) ? file_id : null;
        uploadFile(blob, title, new_id, callback);

        this.title = title;
        document.title = title;
    }

    var constructor = function () {
        // downloadFile(printFile);
    }

    constructor();
}

// window.addEventListener('load', function (evt) {


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
    
function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        console.log('auth is OK');
        Settings.AccessToken = authResult.access_token;

        // load drive lib
        gapi.client.setApiKey(Settings.ApiKey);
        gapi.client.load('drive', 'v2', function () {

            // create wrapping API object
            var folder = new HomeFolder(function () {
                // initHandlers(folder.props.id);
                
                var editor = new Editor(getParameterByName('id'), folder.props.id);
                editor.load(function (success, answer) {
                    // console.log(text);
                    if (!success) {
                        if (answer.code == 401) alert(answer.message);
                    }
                });                
                
            });
        });
    }
    else {
        console.log('auth is error');
    }
}

function checkAuth() {
    gapi.auth.authorize({ 'client_id': Settings.ClientID, 'scope': Settings.Scopes, 'immediate': true }, handleAuthResult);
}

function gapiLoad() {
    window.setTimeout(checkAuth, 1);
}

