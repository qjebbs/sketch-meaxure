// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { MochaJSDelegate } from './MochaJSDelegate';
import { uuidv4, coscriptKeepAround, coscriptNotKeepAround } from './keepAround';
import { logger } from '../meaxure/common/logger';
import { meaxure, wrapWebViewScripts } from './webviewScripts';
import { dispatchFirstClick } from './dispatchFirstClick';

export interface WebviewPanelOptions {
    identifier?: string,
    url: string,
    width: number,
    height: number,
    hideCloseButton?: boolean,
    acceptsFirstMouse?: boolean,
}

interface Webview {
    windowScriptObject(): any;
    mainFrameURL();
}

interface PanelMessageBase<T> {
    __MESSAGE_TYPE__: string;
    __MESSAGE_SUCCESS__?: boolean;
    message: T;
}

interface PanelServerMessage<T> extends PanelMessageBase<T> {
    __SERVER_MESSAGE_ID__: string;
}

interface PanelClientMessage<T> extends PanelMessageBase<T> {
    __CLIENT_MESSAGE_ID__: string;
}

export function createWebviewPanel(options: WebviewPanelOptions): WebviewPanel {
    let panel = new WebviewPanel(options);
    if (!panel.panel) return undefined;
    return panel;
}

const BACKGROUND_COLOR = NSColor.colorWithRed_green_blue_alpha(0.13, 0.13, 0.13, 1);
const BACKGROUND_COLOR_TITLE = NSColor.colorWithRed_green_blue_alpha(0.1, 0.1, 0.1, 1);
export class WebviewPanel {
    private _panel: any;
    private _webview: Webview;
    private _options: WebviewPanelOptions;
    private _isModal: boolean;
    private _threadDictionary: any;
    private _keepAroundID: any;
    private _DOMReadyListener: (...args) => void;
    private _closeListener: (...args) => void
    private _messageListeners: { [key: string]: (data: any) => any } = {};
    private _replyListeners: { [key: string]: (success: boolean, data: any) => void } = {};

    constructor(options: WebviewPanelOptions) {
        if (options.identifier) {
            this._threadDictionary = NSThread.mainThread().threadDictionary();
            if (this._threadDictionary[options.identifier]) {
                return undefined;
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
    get panel(): any {
        return this._panel;
    }
    get webview(): any {
        return this._webview;
    }
    /**
     * close the panel
     */
    close() {
        if (this._isModal) {
            this._panel.orderOut(nil);
            NSApp.stopModal();
            return;
        }
        this._panel.close();
        // afterClose will be called by windowWillClose delegte
        // this.afterClose() 
    }
    private afterClose() {
        if (this._options.identifier) {
            this._threadDictionary.removeObjectForKey(this._options.identifier);
        }
        if (this._closeListener) {
            this._closeListener();
        }
        if (!this._isModal) {
            coscriptNotKeepAround(this._keepAroundID);
        }
    }
    /**
     * Show panel as modal
     */
    showModal() {
        this._isModal = true;
        NSApp.runModalForWindow(this._panel);
    }
    /**
     * Show panel
     */
    show() {
        this._isModal = false;
        this._panel.becomeKeyWindow();
        this._panel.setLevel(NSFloatingWindowLevel);
        this._panel.center();
        this._panel.makeKeyAndOrderFront(nil);
        coscriptKeepAround(this._keepAroundID);
    }
    /**
     * Post a message to webview, and get reply with promise.
     * If no reply handler registered in webview, we get undefined reply.
     * @param msg the msg to post
     */
    postMessage<T>(type: string, msg: T): Promise<T> {
        let requestID = uuidv4();
        let promise = new Promise<T>((resolve, reject) => {
            this._registerReplyListener(requestID, resolve, reject);
        });
        this._postData<PanelServerMessage<T>>({
            __SERVER_MESSAGE_ID__: requestID,
            __MESSAGE_TYPE__: type,
            message: msg,
        });
        return promise;
    }
    /**
     * evaluate script in webview and get its return value with promise
     * @param script the script to run
     */
    evaluateWebScript<T>(script: string): Promise<T> {
        let windowObject = this._webview.windowScriptObject();
        let requestID = uuidv4();
        let scriptWrapped = wrapWebViewScripts(script, requestID);
        // alert(scriptWrapped);
        let promise = new Promise<T>((resolve, reject) => {
            this._registerReplyListener(requestID, resolve, reject);
        });
        windowObject.evaluateWebScript(scriptWrapped);
        return promise;
    }
    /**
     * register a response function to specific request
     * @param reply the function replies to the message
     * @param msgType to what type of request the function replies to.
     */
    onDidReceiveMessage<T>(msgType: string, reply: (data: T) => any) {
        if (!msgType) msgType = "";
        this._messageListeners[msgType] = reply;
    }
    /**
     * register a callback runs when the webview DOM is ready
     * @param callback 
     */
    onWebviewDOMReady<T>(callback: (webView, webFrame) => void) {
        this._DOMReadyListener = _tryCatchListener(callback);
    }
    /**
     * register a callback runs when the panel is closed
     * @param callback 
     */
    onClose(callback: () => void) {
        this._closeListener = _tryCatchListener(callback);
    }
    private _createPanel(): any {
        const TITLE_HEIGHT = 24;
        let frame = NSMakeRect(0, 0, this._options.width, (this._options.height + TITLE_HEIGHT));
        let panel = NSPanel.alloc().init();
        // panel.setTitleVisibility(NSWindowTitleHidden);
        panel.setTitlebarAppearsTransparent(true);
        panel.standardWindowButton(NSWindowCloseButton).setHidden(this._options.hideCloseButton);
        panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
        panel.standardWindowButton(NSWindowZoomButton).setHidden(true);
        panel.setFrame_display(frame, false);
        panel.setBackgroundColor(BACKGROUND_COLOR);

        let contentView = panel.contentView();
        let titlebarView = contentView.superview().titlebarViewController().view();
        let titlebarContainerView = titlebarView.superview();
        titlebarContainerView.setFrame(NSMakeRect(0, this._options.height, this._options.width, TITLE_HEIGHT));
        titlebarView.setFrameSize(NSMakeSize(this._options.width, TITLE_HEIGHT));
        titlebarView.setTransparent(true);
        titlebarView.setBackgroundColor(BACKGROUND_COLOR_TITLE);
        titlebarContainerView.superview().setBackgroundColor(BACKGROUND_COLOR_TITLE);

        let closeButton = panel.standardWindowButton(NSWindowCloseButton);
        closeButton.setFrameOrigin(NSMakePoint(8, 4));
        // https://github.com/skpm/sketch-module-web-view/blob/master/lib/set-delegates.js#L97
        let delegate = new MochaJSDelegate({
            'windowWillClose:': (sender) => {
                this.afterClose();
            },
            'windowDidBecomeKey:': () => {
                if (!this._options.acceptsFirstMouse) return;
                let event = this._panel.currentEvent();
                dispatchFirstClick(this, event);
            },
        });
        panel.setDelegate(delegate.getClassInstance())

        return panel;
    }
    private _createWebview(): Webview {
        let webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, this._options.width, this._options.height));
        let windowObject = webView.windowScriptObject();
        let delegate = new MochaJSDelegate({
            // https://developer.apple.com/documentation/webkit/webframeloaddelegate?language=objc
            "webView:didCommitLoadForFrame:": (webView, webFrame) => {
                windowObject.evaluateWebScript(meaxure);
            },
            "webView:didFinishLoadForFrame:": (webView, webFrame) => {
                if (this._DOMReadyListener) {
                    this._DOMReadyListener(webView, webFrame);
                }
            },
            "webView:didChangeLocationWithinPageForFrame:": (webView, webFrame) => {
                let data = JSON.parse(windowObject.valueForKey("_MeaxurePostedData"));
                this._dispatchMessage(data);
            }
        });
        webView.setBackgroundColor(BACKGROUND_COLOR);
        webView.setFrameLoadDelegate_(delegate.getClassInstance());
        webView.setMainFrameURL_(this._options.url);
        return webView;
    }
    private _dispatchMessage(data: any): void {
        if (data.__SERVER_MESSAGE_ID__ !== undefined) {
            // reply message of server-to-client request
            // logger.debug('A reply of server request recieved.');
            let reply = data as PanelServerMessage<any>;
            let callback = this._replyListeners[reply.__SERVER_MESSAGE_ID__];
            callback(reply.__MESSAGE_SUCCESS__, reply.message);
            delete this._replyListeners[reply.__SERVER_MESSAGE_ID__];
            return;
        }
        if (data.__CLIENT_MESSAGE_ID__ !== undefined) {
            // request message of client-to-server request
            let request = data as PanelClientMessage<any>;
            let requestType = request.__MESSAGE_TYPE__;
            if (!requestType) requestType = '';
            // logger.debug('A "' + requestType + '" request from client recieved.');
            let callback = this._messageListeners[requestType];
            let response: any = undefined;
            let success = true;
            if (callback) {
                try {
                    response = callback(request.message);
                } catch (error) {
                    success = false;
                    response = error;
                    logger.error(error)
                }
            }
            this._replyRequest(request, success, response);
        }
    }
    private _initPanelViews(panel, webView) {
        let contentView = panel.contentView();
        contentView.setWantsLayer(true);
        contentView.layer().setFrame(contentView.frame());
        contentView.layer().setCornerRadius(6);
        contentView.layer().setMasksToBounds(true);
        contentView.addSubview(webView);
    }
    private _postData<T>(data: T): void {
        let windowObject = this._webview.windowScriptObject();
        let script = `
            meaxure.raiseReceiveMessageEvent("${encodeURIComponent(JSON.stringify(data))}");
        `
        windowObject.evaluateWebScript(script);
    }
    private _replyRequest<T>(request: PanelClientMessage<any>, success: boolean, response: T) {
        return this._postData(<PanelClientMessage<any>>{
            __CLIENT_MESSAGE_ID__: request.__CLIENT_MESSAGE_ID__,
            __MESSAGE_SUCCESS__: success,
            message: response,
        });
    }
    private _registerReplyListener<T>(
        requestID: string,
        resolve: (value?: T | PromiseLike<T>) => void,
        reject: (reason?: any) => void,
    ) {
        this._replyListeners[requestID] = function (success: boolean, msg: any) {
            if (success) {
                resolve(msg);
                return;
            }
            reject(msg);
        }
        setTimeout(() => {
            let callback = this._replyListeners[requestID];
            if (!callback) return;
            // reject the promise after timeout, 
            // or the coascript waits for them, 
            // like always set 'coscript.setShouldKeepAround(true)' 
            callback(
                false,
                'A WebviewPanel server-to-client message not replied in 10 seconds.'
            );
            delete this._replyListeners[requestID];
        }, 10000);
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