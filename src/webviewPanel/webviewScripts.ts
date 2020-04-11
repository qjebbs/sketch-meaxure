// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

export const meaxure = `
(function () {
    let messageListeners = {};
    let replyListeners = {};
    window.meaxure = class meaxure {
        static postMessage(type, message) {
            let requestID = uuidv4();
            let promise = new Promise((resolve, reject) => {
                replyListeners[requestID] = function (success, msg) {
                    if (success) {
                        resolve(msg);
                        return;
                    }
                    reject(msg);
                }
                setTimeout(() => {
                    if (!replyListeners[requestID]) return;
                    // reject the promise after timeout, 
                    let callback = replyListeners[requestID];
                    callback(
                        false,
                        'Promise of client request not resolved or rejected in 30 seconds.'
                    );
                    delete replyListeners[requestID];
                }, 30000);
            });
            meaxure.postData({
                __CLIENT_MESSAGE_ID__: requestID,
                __MESSAGE_TYPE__: type,
                message: message,
            })
            return promise;
        }
        static onDidReceiveMessage(msgType, reply) {
            if (!msgType) msgType = "";
            messageListeners[msgType] = reply;
        }
        static raiseReceiveMessageEvent(message) {
            let data = JSON.parse(decodeURIComponent(message));
            dispatchMessage(data);
        }
        static postData(data) {
            window._MeaxurePostedData = JSON.stringify(data);
            window.location.hash = Date.now();
        }
    }

    function dispatchMessage(data) {
        if (data.__CLIENT_MESSAGE_ID__ !== undefined) {
            let callback = replyListeners[data.__CLIENT_MESSAGE_ID__];
            callback(data.__MESSAGE_SUCCESS__, data.message);
            delete replyListeners[data.__CLIENT_MESSAGE_ID__];
            return;
        }
        if (data.__SERVER_MESSAGE_ID__ !== undefined) {
            let requestType = data.__MESSAGE_TYPE__;
            if (!requestType) requestType = '';
            let callback = messageListeners[requestType];
            let response = undefined;
            let success = true;
            if (callback) {
                try {
                    response = callback(data.message);
                } catch (error) {
                    success = false;
                    response = error;
                }
            }
            meaxure.postData({
                __MESSAGE_SUCCESS__: success,
                __SERVER_MESSAGE_ID__: data.__SERVER_MESSAGE_ID__,
                message: response
            });
        }
    }

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
})();
`

export function wrapWebViewScripts(script: string, requestID: string, ): string {
    return `
(function(){
    function scriptCallback(success, result) {
        meaxure.postData({
            __MESSAGE_SUCCESS__: success,
            __SERVER_MESSAGE_ID__: "${requestID}",
            message: result
        })
    }
    try {
        let scriptReturn = (function () {
            ${script}
        })();
        if (scriptReturn instanceof Promise) {
            scriptReturn.then(
                result => scriptCallback(true, result)
            ).catch(
                result => scriptCallback(false, result)
            );
        } else {
            scriptCallback(true, scriptReturn);
        }
    } catch (error) {
        scriptCallback(false, error);
    }
})() 
    `
}