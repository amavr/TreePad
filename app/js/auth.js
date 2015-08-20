// 'use strict';

function AuthHelper(callback) {

    var cb = callback;
    var can_auth = true;

    var handleAuthResult = function (authResult) {

        if (authResult && !authResult.error) {
            cb(authResult.access_token);
        } else {
            if (can_auth) {
                can_auth = false;

                gapi.auth.authorize(
                    { 'client_id': Settings.ClientID, 'scope': Settings.Scopes, 'immediate': false },
                    handleAuthResult);
            }
            else {
                log('handleAuthResult problem');
                alert(authResult.error);
                cb(null);
            }
        }
    };

    var checkAuth = function () {
        gapi.auth.authorize(
            { 'client_id': Settings.ClientID, 'scope': Settings.Scopes, 'immediate': true },
            handleAuthResult
            );
    };

    var constructor = function () {
        checkAuth();
    };

    constructor();
}
