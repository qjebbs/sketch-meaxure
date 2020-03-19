export const meaxure = `
window.meaxure = class meaxure {
    static postMessage(message) {
        window._MexurePostMessage = JSON.stringify(message);
        window.location.hash = Date.now();
    }
    static postRequest(message) {
        let requestID = meaxure.uuidv4();
        let promise = new Promise((resolve, reject) => {
            meaxure.replyListeners[requestID] = function (success, msg) {
                if (success) {
                    resolve(msg);
                    return;
                }
                reject(msg);
            }
            setTimeout(() => {
                if (!meaxure.replyListeners[requestID]) return;
                // reject the promise after timeout, 
                let callback = this.replyListeners[requestID];
                callback(
                    EventType.PromiseReject,
                    'Promise of evaluateWebScript not resolved or rejected in 30 seconds.'
                );
                delete this.replyListeners[requestID];
            }, 30000);
        });
        meaxure.postMessage({
            __REQUEST_IDENTITY_C2S__: requestID,
            message: message,
        })
        return promise;
    }
    static onDidReceiveMessage(listener) {
        meaxure.messageListener = listener;
    }
    static receiveMessage(message) {
        let data = JSON.parse(decodeURIComponent(message));
        if (data.__REQUEST_SUCCESS__ !== undefined && data.__REQUEST_IDENTITY_C2S__ !== undefined) {
            let callback = meaxure.replyListeners[data.__REQUEST_IDENTITY_C2S__];
            callback(data.__REQUEST_SUCCESS__, data.message);
            delete meaxure.replyListeners[data.__REQUEST_IDENTITY_C2S__];
            return;
        }
        if (!meaxure.messageListener) return;
        meaxure.messageListener(data);
    }
    static uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
meaxure.messageListener = undefined;
meaxure.replyListeners = {};
`

export function wrapWebViewScripts(script: string, requestID: string, ): string {
    return `
(function(){
    function scriptCallback(success, result) {
        meaxure.postMessage({
            __REQUEST_SUCCESS__: success,
            __REQUEST_IDENTITY_S2C__: "${requestID}",
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