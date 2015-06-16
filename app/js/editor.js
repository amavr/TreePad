function Editor(FileID, HomeFolderId, AccessToken) {

    var me = this;
    var file_id = FileID;
    var folder_id = HomeFolderId;
    this.title = '';
    var access_token = AccessToken;

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
            'headers': { 'Authorization': 'Bearer ' + access_token },
            'method': 'GET',
            'params': { "fields": "downloadUrl,title,parents(id,parentLink)" }
        });

        request.execute(function (file) {
            if (file.downloadUrl) {
                me.title = file.title;
                document.title = me.title;
                var xhr = new XMLHttpRequest();
                xhr.open('GET', file.downloadUrl);
                xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
                xhr.onload = function () {
                    showWait(false);
                    callback(xhr.responseText);
                };
                xhr.onerror = function () {
                    showWait(false);
                    callback(null);
                };
                xhr.send();
            } else {
                showWait(false);
                callback(null);
            }
        });
    }

    var uploadFile = function (data, callback) {
        showWait(true);
        var request = gapi.client.request({
            'path': '/upload/drive/v2/files/' + file_id,
            'method': 'PUT',
            'params': { 'uploadType': 'media', 'alt': 'json' },
            'headers': { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + access_token},
            'body': data
        });

        if (!callback) {
            callback = function (file) {
                console.log(file)
            };
        }

        request.execute(function (file) {
            showWait(false);
            callback(file);
        });
    }



    var insertFile = function(fileData, title, id, callback) {
        showWait(true);

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

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
                'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"', 'Authorization': 'Bearer ' + access_token},
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

    this.load = function (callback) {
        downloadFile(callback);
    }

    this.save = function (data, callback) {
        // uploadFile(data, callback);
        var text = JSON.stringify(data);
        var blob = new Blob([text], { type: 'application/json' });
        insertFile(blob, me.title, file_id, callback);
    }

    this.saveas = function (data, title, callback) {
        var text = JSON.stringify(data);
        var blob = new Blob([text], { type: 'application/json' });
        var new_id = (title === me.title) ? file_id : null;
        insertFile(blob, title, new_id, callback);

        this.title = title;
        document.title = title;
    }

    var constructor = function () {
        // downloadFile(printFile);
    }

    constructor();
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// window.addEventListener('load', function (evt) {
function initHandlers(home_folder_id) {

    var tree = new TreePad("#tree-box");
    var editor = new Editor(getParameterByName('id'), home_folder_id, getParameterByName('ses'));

    editor.load(function (text) {
        // console.log(text);
        var nodes = JSON.parse(text);
        // console.log(nodes);
        tree.show(nodes);
    });

    $('#btn-upd').bind('click', function () {
        var data = tree.getData();
        editor.save(data, function (file) {
            console.log(file);
        });
    });

    $('#btn-saveas').data('filename', editor.title);

    $('#dlg-btn-save').bind('click', function () {
        var data = tree.getData();
        editor.saveas(data, $('#file-name').val(), function (file) {
            console.log(file);
        });
    });

    $('#btn-add').bind('click', function () {
        tree.add({ title: 'new node', text: '' });
    });

    $('#btn-del').bind('click', function () {
        tree.delete();
    });

    $('#btn-debug').bind('click', function () {
        var data = tree.getData();
        var text = JSON.stringify(data);
        console.log(data);
        console.log(text);
    });

    // обновление текста узела при изменении textarea
    $('#text').keyup(function () {
        var text = $("#text").val();
        tree.getSelected().parent().data('text', text);
    });


    $('#dialogSave').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var filename = button.data('filename'); // Extract info from data-* attributes
        var modal = $(this);
        modal.find('.modal-body input').val(editor.title);
    });
}

function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        console.log('auth is OK');
        Settings.AccessToken = authResult.access_token;

        // load drive lib
        gapi.client.setApiKey(Settings.ApiKey);
        gapi.client.load('drive', 'v2', function () {

            // create wrapping API object
            folder = new HomeFolder(function () {
                initHandlers(folder.props.id);
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

