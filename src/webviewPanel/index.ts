import { MochaJSDelegate } from './MochaJSDelegate';
import { uuidv4, coscriptKeepAround, coscriptNotKeepAround } from '../state/keepAround';
import { logger } from '../api/logger';

export interface WebviewPanelOptions {
    identifier?: string,
    url: string,
    width: number,
    height: number,
    hideCloseButton?: boolean,
}

interface Webview {
    windowScriptObject(): any;
    mainFrameURL();
}

enum EventType {
    PromiseResolve,
    PromiseReject,
}

interface PanelEventMessage {
    __EVENT_TYPE__: EventType;
    __EVENT_IDENTITY__: string;
    message: any;
}

export function createWebviewPanel(options: WebviewPanelOptions): WebviewPanel {
    return new WebviewPanel(options);
}

const BACKGROUND_COLOR = NSColor.colorWithRed_green_blue_alpha(0.13, 0.13, 0.13, 1);
const BACKGROUND_COLOR_TITLE = NSColor.colorWithRed_green_blue_alpha(0.1, 0.1, 0.1, 1);
export class WebviewPanel {
    private _panel: any;
    private _webview: Webview;
    private _options: WebviewPanelOptions;
    private _receiveMessageListener: (...args) => void;
    private _DOMReadyListener: (...args) => void;
    private _closeListener: (...args) => void
    private _eventListeners: { [key: string]: (eventType: EventType, data: any) => void } = {};
    private _isModal: boolean;
    private _threadDictionary: any;
    private _keepAroundID: any;

    static exists(identifier: string): boolean {
        return !!NSThread.mainThread().threadDictionary()[identifier];
    }

    constructor(options: WebviewPanelOptions) {
        if (options.identifier) {
            this._threadDictionary = NSThread.mainThread().threadDictionary();
            if (this._threadDictionary[options.identifier]) {
                return this._threadDictionary[options.identifier];
            }
        }
        this._keepAroundID = uuidv4();
        this._options = Object.assign({
            width: 240,
            height: 320,
            hideCloseButton: false,
            data: {},
        }, options);
        if (!NSFileManager.defaultManager().fileExistsAtPath(this._options.url))
            throw "file not found: " + this._options.url;

        this._panel = this._createPanel();
        this._webview = this._createWebview();
        this._initPanelViews(this._panel, this._webview);
        if (this._options.identifier) {
            this._threadDictionary[this._options.identifier] = this;
        }
    }

    private _createPanel(): any {
        let frame = NSMakeRect(0, 0, this._options.width, (this._options.height + 32));
        let panel = NSPanel.alloc().init();
        panel.setTitleVisibility(NSWindowTitleHidden);
        panel.setTitlebarAppearsTransparent(true);
        panel.standardWindowButton(NSWindowCloseButton).setHidden(this._options.hideCloseButton);
        panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
        panel.standardWindowButton(NSWindowZoomButton).setHidden(true);
        panel.setFrame_display(frame, false);
        panel.setBackgroundColor(BACKGROUND_COLOR);

        let closeButton = panel.standardWindowButton(NSWindowCloseButton);
        closeButton.setFrameOrigin(NSMakePoint(8, 8));
        closeButton.setCOSJSTargetFunction((sender) => {
            this.close();
        });
        closeButton.setAction("callAction:");

        return panel;
    }
    private _createWebview(): Webview {
        let webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, this._options.width, this._options.height));
        let windowObject = webView.windowScriptObject();
        let delegate = new MochaJSDelegate({
            // https://developer.apple.com/documentation/webkit/webframeloaddelegate?language=objc
            "webView:didCommitLoadForFrame:": (webView, webFrame) => {
                windowObject.evaluateWebScript(`
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
                meaxure.listener = undefined;`);
            },
            "webView:didFinishLoadForFrame:": (webView, webFrame) => {
                if (this._DOMReadyListener) {
                    this._DOMReadyListener(webView, webFrame);
                }
            },
            "webView:didChangeLocationWithinPageForFrame:": (webView, webFrame) => {
                let data = JSON.parse(windowObject.valueForKey("_MexurePostMessage"));
                if (data.__EVENT_TYPE__ !== undefined && data.__EVENT_IDENTITY__ !== undefined) {
                    // an internal event message
                    let eventMessage = data as PanelEventMessage;
                    let callback = this._eventListeners[eventMessage.__EVENT_IDENTITY__];
                    callback(eventMessage.__EVENT_TYPE__, eventMessage.message);
                    delete this._eventListeners[eventMessage.__EVENT_IDENTITY__];
                    return;
                }
                if (!this._receiveMessageListener) return;
                this._receiveMessageListener(data);
            }
        });
        webView.setBackgroundColor(BACKGROUND_COLOR);
        webView.setFrameLoadDelegate_(delegate.getClassInstance());
        webView.setMainFrameURL_(this._options.url);
        return webView;
    }
    private _initPanelViews(panel, webView) {
        let contentView = panel.contentView();
        let titlebarView = contentView.superview().titlebarViewController().view();
        let titlebarContainerView = titlebarView.superview();
        titlebarContainerView.setFrame(NSMakeRect(0, this._options.height, this._options.width, 32));
        titlebarView.setFrameSize(NSMakeSize(this._options.width, 32));
        titlebarView.setTransparent(true);
        titlebarView.setBackgroundColor(BACKGROUND_COLOR_TITLE);
        titlebarContainerView.superview().setBackgroundColor(BACKGROUND_COLOR_TITLE);

        contentView.setWantsLayer(true);
        contentView.layer().setFrame(contentView.frame());
        contentView.layer().setCornerRadius(6);
        contentView.layer().setMasksToBounds(true);
        contentView.addSubview(webView);
    }
    close() {
        if (this._closeListener) {
            this._closeListener();
        }
        if (this._isModal) {
            this._panel.orderOut(nil);
            NSApp.stopModal();
        } else {
            this._panel.close();
            coscriptNotKeepAround(this._keepAroundID);
        }
        if (this._options.identifier) {
            this._threadDictionary.removeObjectForKey(this._options.identifier);
        }
    }
    showModal() {
        this._isModal = true;
        NSApp.runModalForWindow(this._panel);
    }
    show() {
        this._isModal = false;
        this._panel.becomeKeyWindow();
        this._panel.setLevel(NSFloatingWindowLevel);
        this._panel.center();
        this._panel.makeKeyAndOrderFront(nil);
        coscriptKeepAround(this._keepAroundID);
    }
    postMessage<T>(msg: T): Promise<any> {
        // let windowObject = this._webview.windowScriptObject();
        let script = `
            meaxure.receiveMessage("${encodeURIComponent(JSON.stringify(msg))}");
        `
        return this.evaluateWebScript(script);
    }
    evaluateWebScript(script: string): Promise<any> {
        let windowObject = this._webview.windowScriptObject();
        let eventID = uuidv4();
        let scriptWrapped = `
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
        `;
        // alert(scriptWrapped);
        let promise = new Promise((resolve, reject) => {
            this._eventListeners[eventID] = function (eventType: EventType, msg: any) {
                switch (eventType) {
                    case EventType.PromiseResolve:
                        resolve(msg);
                        return;
                    case EventType.PromiseReject:
                        reject(msg);
                        return;
                    default:
                        break;
                }
            }
            setTimeout(() => {
                if (!this._eventListeners[eventID]) return;
                // reject the promise after timeout, 
                // or the coascript waits for them, 
                // like always set 'coscript.setShouldKeepAround(true)' 
                let callback = this._eventListeners[eventID];
                callback(
                    EventType.PromiseReject,
                    'Promise of evaluateWebScript not resolved or rejected in 10 seconds.'
                );
                delete this._eventListeners[eventID];
            }, 10000);
        });
        windowObject.evaluateWebScript(scriptWrapped);
        return promise;
    }
    onDidReceiveMessage<T>(listener: (e: T) => any) {
        this._receiveMessageListener = _tryCatchListener(listener);
    }
    onWebviewDOMReady<T>(listener: (webView, webFrame) => void) {
        this._DOMReadyListener = _tryCatchListener(listener);
    }
    onClose(listener: () => void) {
        this._closeListener = _tryCatchListener(listener);
    }
}
function _tryCatchListener(fn: Function) {
    return function (...args): void {
        try {
            fn(...args);
        } catch (error) {
            logger.error(error);
        }
    }
}