import { MochaJSDelegate } from './MochaJSDelegate';
import { _ } from './language';
import { Config, setConfigs } from './config';
import { message, extend } from './helper';
import { context } from './context';
import { logger } from './logger';

export function SMPanel(options) {
    options = /*this.*/extend(options, {
        url: /*this.*/context.resourcesRoot + "/panel/settings.html",
        width: 240,
        height: 316,
        floatWindow: false,
        hiddenClose: false,
        data: {
            density: 2,
            unit: "dp/sp"
        },
        callback: function (data) {
            return data;
        }
    })
    if (!NSFileManager.defaultManager().fileExistsAtPath(options.url))
        throw "file not found: " + options.url;
    let result = false;
    options.url = encodeURI("file://" + options.url);

    var frame = NSMakeRect(0, 0, options.width, (options.height + 32)),
        titleBgColor = NSColor.colorWithRed_green_blue_alpha(0.1, 0.1, 0.1, 1),
        contentBgColor = NSColor.colorWithRed_green_blue_alpha(0.13, 0.13, 0.13, 1);

    if (options.identifier) {
        var threadDictionary = NSThread.mainThread().threadDictionary();
        if (threadDictionary[options.identifier]) {
            return false;
        }
    }

    var Panel = NSPanel.alloc().init();
    Panel.setTitleVisibility(NSWindowTitleHidden);
    Panel.setTitlebarAppearsTransparent(true);
    Panel.standardWindowButton(NSWindowCloseButton).setHidden(options.hiddenClose);
    Panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
    Panel.standardWindowButton(NSWindowZoomButton).setHidden(true);
    Panel.setFrame_display(frame, false);
    Panel.setBackgroundColor(contentBgColor);
    var contentView = Panel.contentView(),
        webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, options.width, options.height)),
        windowObject = webView.windowScriptObject(),
        delegate = new MochaJSDelegate({
            "webView:didFinishLoadForFrame:": (function (webView, webFrame) {
                var SMAction = [
                    "function SMAction(hash, data){",
                    "if(data){",
                    "window.SMData = encodeURI(JSON.stringify(data));",
                    "}",
                    "window.location.hash = hash;",
                    "}"
                ].join("")
                let DOMReady = [
                    "$(",
                    "function(){",
                    "init(" + JSON.stringify(options.data) + ")",
                    "}",
                    ");"
                ].join("");

                windowObject.evaluateWebScript(SMAction);
                windowObject.evaluateWebScript(context.language);
                windowObject.evaluateWebScript(DOMReady);
            }),
            "webView:didChangeLocationWithinPageForFrame:": (function (webView, webFrame) {
                var request = NSURL.URLWithString(webView.mainFrameURL()).fragment();

                if (request == "submit") {
                    var data = JSON.parse(decodeURI(windowObject.valueForKey("SMData")));
                    options.callback(data);
                    result = true;
                    if (!options.floatWindow) {
                        windowObject.evaluateWebScript("window.location.hash = 'close';");
                    }
                } else if (request == "close") {
                    if (!options.floatWindow) {
                        Panel.orderOut(nil);
                        NSApp.stopModal();
                    } else {
                        Panel.close();
                    }
                } else if (request == "donate") {
                    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString("http://utom.design/measure/donate.html?ref=update"));
                    // windowObject.evaluateWebScript("window.location.hash = 'close';");
                } else if (request == "import") {
                    if (options.importCallback(windowObject)) {
                        /*self.*/message(_("Import complete!"));
                    }
                } else if (request == "export") {
                    if (options.exportCallback(windowObject)) {
                        /*self.*/message(_("Export complete!"));
                    }
                } else if (request == "export-xml") {
                    if (options.exportXMLCallback(windowObject)) {
                        /*self.*/message(_("Export complete!"));
                    }
                } else if (request == "add") {
                    options.addCallback(windowObject);
                } else if (request == "focus") {
                    var point = Panel.currentEvent().locationInWindow(),
                        y = NSHeight(Panel.frame()) - point.y - 32;
                    windowObject.evaluateWebScript("lookupItemInput(" + point.x + ", " + y + ")");
                }
                windowObject.evaluateWebScript("window.location.hash = '';");
            })
        });

    contentView.setWantsLayer(true);
    contentView.layer().setFrame(contentView.frame());
    contentView.layer().setCornerRadius(6);
    contentView.layer().setMasksToBounds(true);

    webView.setBackgroundColor(contentBgColor);
    webView.setFrameLoadDelegate_(delegate.getClassInstance());
    webView.setMainFrameURL_(options.url);

    contentView.addSubview(webView);

    var closeButton = Panel.standardWindowButton(NSWindowCloseButton);
    closeButton.setCOSJSTargetFunction(function (sender) {
        var request = NSURL.URLWithString(webView.mainFrameURL()).fragment();

        if (options.floatWindow && request == "submit") {
            let data = JSON.parse(decodeURI(windowObject.valueForKey("SMData")));
            options.callback(data);
        }

        if (options.identifier) {
            threadDictionary.removeObjectForKey(options.identifier);
        }

        // self.wantsStop = true;
        if (options.floatWindow) {
            Panel.close();
        } else {
            Panel.orderOut(nil);
            NSApp.stopModal();
        }

    });
    closeButton.setAction("callAction:");

    var titlebarView = contentView.superview().titlebarViewController().view(),
        titlebarContainerView = titlebarView.superview();
    closeButton.setFrameOrigin(NSMakePoint(8, 8));
    titlebarContainerView.setFrame(NSMakeRect(0, options.height, options.width, 32));
    titlebarView.setFrameSize(NSMakeSize(options.width, 32));
    titlebarView.setTransparent(true);
    titlebarView.setBackgroundColor(titleBgColor);
    titlebarContainerView.superview().setBackgroundColor(titleBgColor);

    if (options.floatWindow) {
        Panel.becomeKeyWindow();
        Panel.setLevel(NSFloatingWindowLevel);
        Panel.center();
        Panel.makeKeyAndOrderFront(nil);
        if (options.identifier) {
            threadDictionary[options.identifier] = Panel;
        }
        return webView;
    } else {
        if (options.identifier) {
            threadDictionary[options.identifier] = Panel;
        }
        NSApp.runModalForWindow(Panel);
    }

    return result;
}
export function settingsPanel() {
    let data: Config = {};

    if (/*this.*/context.configs) {
        data.scale = /*this.*/context.configs.scale;
        data.unit = /*this.*/context.configs.unit;
        data.colorFormat = /*this.*/context.configs.colorFormat;
        data.artboardOrder = /*this.*/context.configs.artboardOrder;
    }

    return /*this.*/SMPanel({
        width: 240,
        height: 386,
        data: data,
        callback: function (data) {
            logger.debug("setting panel returned:", data);
            /*self.*/context.configs = /*self.*/setConfigs(data);
        }
    });

}
export function sizesPanel() {
    var self = this,
        data: any = {};

    if (/*this.*/context.configs.sizes && /*this.*/context.configs.sizes.widthPlacement) data.widthPlacement = /*this.*/context.configs.sizes.widthPlacement;
    if (/*this.*/context.configs.sizes && /*this.*/context.configs.sizes.heightPlacement) data.heightPlacement = /*this.*/context.configs.sizes.heightPlacement;
    if (/*this.*/context.configs.sizes && /*this.*/context.configs.sizes.byPercentage) data.byPercentage = /*this.*/context.configs.sizes.byPercentage;

    return /*this.*/SMPanel({
        url: /*this.*/context.resourcesRoot + "/panel/sizes.html",
        width: 240,
        height: 358,
        data: data,
        callback: function (data) {
            /*self.*/context.configs = /*self.*/setConfigs({
            sizes: data
        });
        }
    });
}
export function spacingsPanel() {
    var self = this,
        data: any = {};

    data.placements = (/*this.*/context.configs.spacings && /*this.*/context.configs.spacings.placements) ? /*this.*/context.configs.spacings.placements : ["top", "left"];
    if (/*this.*/context.configs.spacings && /*this.*/context.configs.spacings.byPercentage) data.byPercentage = /*this.*/context.configs.spacings.byPercentage;

    return /*this.*/SMPanel({
        url: /*this.*/context.resourcesRoot + "/panel/spacings.html",
        width: 240,
        height: 314,
        data: data,
        callback: function (data) {
            /*self.*/context.configs = /*self.*/setConfigs({
            spacings: data
        });
        }
    });
}
export function propertiesPanel() {
    var self = this,
        data = (/*this.*/context.configs.properties) ? /*this.*/context.configs.properties : {
            placement: "top",
            properties: ["color", "border"]
        };
    return /*this.*/SMPanel({
        url: /*this.*/context.resourcesRoot + "/panel/properties.html",
        width: 280,
        height: 356,
        data: data,
        callback: function (data) {
            /*self.*/context.configs = /*self.*/setConfigs({
            properties: data
        });
        }
    });
}
