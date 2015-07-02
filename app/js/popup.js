function PageInfo() {

    var me = this;

    var re = /\d{2}(\d{2})-(\d{2})-(\d{2})T(\d{2}):(\d{2}).*/gi

    this.box_list = null;
    var inp = null;
    var btn = null;

    var dt2str = function (dt) {
        return dt.replace(re, '$3.$2.$1 $4:$5');
    }

    var log = function (msg) {
        var box_log = $('#box-log');
        var html = box_log.html();
        html += msg + '<br/>';
        box_log.html(html);
    }

    var onFileSelect = function (e) {
        // console.log(e);
        chrome.runtime.getBackgroundPage(function (eventPage) {
            var file_id = e.target.id.slice(5);
            eventPage.openTab(file_id, Settings.AccessToken);
        });
        return false;
    }

    var setHandlers = function (item, i) {
        btn.on('click', function () {
            var text = '[]';
            var blob = new Blob([text], { type: 'application/json' });
            drive.addFile(blob, inp.val().trim(), null, function (file) {
                // console.log(JSON.stringify(file));
                chrome.runtime.getBackgroundPage(function (eventPage) {
                    eventPage.openTab(file.id, Settings.AccessToken);
                });
                return false;
            });
        });

        inp.keyup(function () {
            log('changed');
            var text = inp.val().trim();
            log(text);
            if (text == '') {
                btn.attr('disabled', 'disabled');
            }
            else {
                btn.removeAttr('disabled');
            }
        });
    }

    me.showFiles = function (files) {
        var html = '<ul>';
        // html += '<li class="file-new"><a id="file-new" class="file-ref" href="#">New document</a></li>';
        for (var i = 0; i < files.length; i++) {
            html += '<li><a id="file-' + files[i].id + '" class="file-ref" href="' + files[i].selfLink + '">' + files[i].title + '</a></li>';
        }
        html += '</ul>';
        me.box_list.innerHTML = html;

        $('.file-ref').on('click', onFileSelect);

        var box = $('#box-list');
        $('#new-doc-box').show();
        var w = box.width();
        inp.width(w - 48);
    }

    function constructor() {
        me.box_list = document.getElementById("box-list");
        inp = $('#inp-filename');
        btn = $('#add-file');
        setHandlers();
    }

    constructor();
}

function x() {
    chrome.identity.getAuthToken({
        interactive: true
    }, function (token) {
        if (chrome.runtime.lastError) {
            alert(chrome.runtime.lastError.message);
            return;
        }
        var x = new XMLHttpRequest();
        x.open('GET', 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token);
        x.onload = function () {
            alert(x.response);
        };
        x.send();
    });
}


function checkAuth() {

    drive = new Drive(function () {
        drive.getFiles(function (files) {
            // console.log(files);
            $('#btn-new').css('display', 'inline');//show();
            var pi = new PageInfo();
            pi.showFiles(files);
            // console.log($('#btn-new'));
        });
    });
}

function gapiLoad() {
    window.setTimeout(checkAuth, 1);
}


