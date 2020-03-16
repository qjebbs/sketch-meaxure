import { MochaJSDelegate } from './MochaJSDelegate';

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

export function createWebviewPanel(options: WebviewPanelOptions): WebviewPanel {
    return new WebviewPanel(options);
}

export class WebviewPanel {
    private _panel: any;
    private _webview: Webview;
    private _options: WebviewPanelOptions;
    private _receiveMessageListener: (e: any) => any;
    private _DOMReadyListener: (webView, webFrame) => void;
    private _isModal: boolean;
    private _threadDictionary: any;

    constructor(options: WebviewPanelOptions) {
        if (options.identifier) {
            this._threadDictionary = NSThread.mainThread().threadDictionary();
            if (this._threadDictionary[options.identifier]) {
                return this._threadDictionary[options.identifier];
            }
        }
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
        let contentBgColor = NSColor.colorWithRed_green_blue_alpha(0.13, 0.13, 0.13, 1);
        let panel = NSPanel.alloc().init();
        panel.setTitleVisibility(NSWindowTitleHidden);
        panel.setTitlebarAppearsTransparent(true);
        panel.standardWindowButton(NSWindowCloseButton).setHidden(this._options.hideCloseButton);
        panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
        panel.standardWindowButton(NSWindowZoomButton).setHidden(true);
        panel.setFrame_display(frame, false);
        panel.setBackgroundColor(contentBgColor);

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
                this._DOMReadyListener(webView, webFrame);
            },
            "webView:didChangeLocationWithinPageForFrame:": (webView, webFrame) => {
                if (!this._receiveMessageListener) return;
                // let hash = NSURL.URLWithString(webView.mainFrameURL()).fragment();
                let data = JSON.parse(windowObject.valueForKey("_MexurePostMessage"));
                this._receiveMessageListener(data);
            }
        });
        webView.setFrameLoadDelegate_(delegate.getClassInstance());
        webView.setMainFrameURL_(this._options.url);
        return webView;
    }
    private _initPanelViews(panel, webView) {
        let titleBgColor = NSColor.colorWithRed_green_blue_alpha(0.1, 0.1, 0.1, 1);
        let contentView = panel.contentView();
        let titlebarView = contentView.superview().titlebarViewController().view();
        let titlebarContainerView = titlebarView.superview();
        titlebarContainerView.setFrame(NSMakeRect(0, this._options.height, this._options.width, 32));
        titlebarView.setFrameSize(NSMakeSize(this._options.width, 32));
        titlebarView.setTransparent(true);
        titlebarView.setBackgroundColor(titleBgColor);
        titlebarContainerView.superview().setBackgroundColor(titleBgColor);

        contentView.setWantsLayer(true);
        contentView.layer().setFrame(contentView.frame());
        contentView.layer().setCornerRadius(6);
        contentView.layer().setMasksToBounds(true);
        contentView.addSubview(webView);
    }
    close() {
        if (this._isModal) {
            this._panel.orderOut(nil);
            NSApp.stopModal();
        } else {
            this._panel.close();
            coscript.setShouldKeepAround(false);
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
        coscript.setShouldKeepAround(true);
    }
    postMessage<T>(msg: T) {
        let windowObject = this._webview.windowScriptObject();
        let script = `
            meaxure.receiveMessage("${encodeURIComponent(JSON.stringify(msg))}");
        `
        windowObject.evaluateWebScript(script);
    }
    evaluateWebScript(script: string) {
        let windowObject = this._webview.windowScriptObject();
        windowObject.evaluateWebScript(script);
    }
    onDidReceiveMessage<T>(listener: (e: T) => any) {
        this._receiveMessageListener = listener;
    }
    onWebviewDOMReady<T>(listener: (webView, webFrame) => void) {
        this._DOMReadyListener = listener;
    }
} 