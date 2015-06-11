function Editor(FileID, AccessToken) {

    var me = this;
    var file_id = FileID;
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
            'params': { "fields": "downloadUrl,title" }
        });

        request.execute(function (file) {
            if (file.downloadUrl) {
                document.title = file.title;
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

    var printFile = function (content) {
        if (content) {
            var box = document.getElementById("box-log");
            if (box) {
                box.innerHTML = content;
            }
        }
    }

    this.load = function (callback) {
        downloadFile(callback);
    }

    this.save = function (data, callback) {
        uploadFile(data, callback);
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

window.addEventListener('load', function (evt) {

    var tree = new TreePad("#tree-box");
    var editor = new Editor(getParameterByName('id'), getParameterByName('ses'));

    editor.load(function (text) {
        console.log(text);
        var nodes = JSON.parse(text);
        // console.log(nodes);
        tree.show(nodes);
    });

    $('#btn-upd').bind('click', function () {
        var data = tree.getData();
        var text = JSON.stringify(data);
        editor.save(text);
        console.log(data);
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

});

function onApiLoad() {
    // editor = new Editor(getParameterByName('id'), getParameterByName('ses'));
}

