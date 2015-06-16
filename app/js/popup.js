function PageInfo() {

    var me = this;

    var re = /\d{2}(\d{2})-(\d{2})-(\d{2})T(\d{2}):(\d{2}).*/gi

    me.box_log = null;

    var dt2str = function (dt) {
        return dt.replace(re, '$3.$2.$1 $4:$5');
    }

    var onFileSelect = function (e) {
        chrome.runtime.getBackgroundPage(function (eventPage) {
            console.log(e);
            var file_id = e.srcElement.id.slice(5);
            eventPage.openTab(file_id, Settings.AccessToken);
        });
        return false;
    }

    var setRefHandler = function (item, i) {
        Event.add(item, 'click', onFileSelect);
    }

    me.showFiles = function (files) {
        var html = '<ul>';
        for (var i = 0; i < files.length; i++) {
            html += '<li><a id="file-' + files[i].id + '" class="file-ref" href="' + files[i].selfLink + '">' + files[i].title + '</a></li>';
        }
        html += '</ul>';
        me.box_log.innerHTML = html;

        var refs = document.getElementsByClassName('file-ref');
        for (var prop in refs)
            setRefHandler(refs[prop], prop);
    }

    function constructor() {
        me.box_log = document.getElementById("box-log");
        me.btn1 = document.getElementById("btn1");
    }

    constructor();
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
                folder.getFiles(function (files) {
                    var pi = new PageInfo();
                    pi.showFiles(files);
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


