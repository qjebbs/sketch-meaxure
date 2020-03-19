import { EventType } from "."

export const meaxure = `
class meaxure {
    static postMessage(message) {
        window._MexurePostMessage = JSON.stringify(message);
        window.location.hash = Date.now();
    }
    static onDidReceiveMessage(listener) {
        meaxure.listener = listener;
    }
    static receiveMessage(message) {
        if (!meaxure.listener) return;
        let data = JSON.parse(decodeURIComponent(message));
        meaxure.listener(data);
    }
}
meaxure.listener = undefined;
`

export function wrapWebViewScripts(script: string, eventID: string, ): string {
    return `
(function(){
    function scriptCallback(eventType, result) {
        meaxure.postMessage({
            __EVENT_TYPE__: eventType,
            __EVENT_IDENTITY__: "${eventID}",
            message: result
        })
    }
    try {
        let scriptReturn = (function () {
            ${script}
        })();
        if (scriptReturn instanceof Promise) {
            scriptReturn.then(
                result => scriptCallback(${EventType.PromiseResolve}, result)
            ).catch(
                result => scriptCallback(${EventType.PromiseReject}, result)
            );
        } else {
            scriptCallback(${EventType.PromiseResolve}, scriptReturn);
        }
    } catch (error) {
        scriptCallback(${EventType.PromiseReject}, error);
    }
})() 
    `
}