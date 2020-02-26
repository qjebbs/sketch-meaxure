import { context } from "./context";
import { commandOverlays, commandSizes, commandSpacings, commandProperties, commandNote, commandExportable, commandColor, commandExport, commandHidden, commandLocked, commandSettings } from ".";

function getImage(size, name) {
    var isRetinaDisplay = (NSScreen.mainScreen().backingScaleFactor() > 1) ? true : false;
    let suffix = (isRetinaDisplay) ? "@2x" : "",
        imageURL = NSURL.fileURLWithPath(/*this.*/context.resourcesRoot + "/toolbar/" + name + suffix + ".png"),
        image = NSImage.alloc().initWithContentsOfURL(imageURL);

    return image
}
function addImage(rect, name) {
    var view = NSImageView.alloc().initWithFrame(rect),
        image = /*this.*/getImage(rect.size, name);
    view.setImage(image);
    return view;
}
function addButton(rect, name, callAction) {
    var button = NSButton.alloc().initWithFrame(rect),
        image = /*this.*/getImage(rect.size, name);

    button.setImage(image);
    button.setBordered(false);
    button.sizeToFit();
    button.setButtonType(NSMomentaryChangeButton)
    button.setCOSJSTargetFunction(callAction);
    button.setAction("callAction:");
    return button;
}
export function markToolbar() {
    var identifier = "co.jebbs.measure",
        threadDictionary = NSThread.mainThread().threadDictionary(),
        Toolbar = threadDictionary[identifier];

    coscript.setShouldKeepAround(true);
    if (!Toolbar) {
        Toolbar = NSPanel.alloc().init();
        Toolbar.setStyleMask(NSTitledWindowMask + NSFullSizeContentViewWindowMask);
        Toolbar.setBackgroundColor(NSColor.colorWithRed_green_blue_alpha(0.10, 0.10, 0.10, 1));
        Toolbar.setTitleVisibility(NSWindowTitleHidden);
        Toolbar.setTitlebarAppearsTransparent(true);

        Toolbar.setFrame_display(NSMakeRect(0, 0, 584, 48), false);
        Toolbar.setMovableByWindowBackground(true);
        Toolbar.becomeKeyWindow();
        Toolbar.setLevel(NSFloatingWindowLevel);

        var contentView = Toolbar.contentView(),
            closeButton = /*self.*/addButton(NSMakeRect(14, 14, 20, 20), "icon-close",
                function (sender) {
                    coscript.setShouldKeepAround(false);
                    threadDictionary.removeObjectForKey(identifier);
                    Toolbar.close();
                }),
            overlayButton = /*self.*/addButton(NSMakeRect(64, 14, 20, 20), "icon-overlay",
                function (sender) {
                    commandOverlays();
                }),
            sizesButton = /*self.*/addButton(NSMakeRect(112, 14, 20, 20), "icon-sizes",
                function (sender) {
                    commandSizes();
                }),
            spacingsButton = /*self.*/addButton(NSMakeRect(160, 14, 20, 20), "icon-spacings",
                function (sender) {
                    commandSpacings();
                }),
            propertiesButton = /*self.*/addButton(NSMakeRect(208, 14, 20, 20), "icon-properties",
                function (sender) {
                    commandProperties();
                }),
            notesButton = /*self.*/addButton(NSMakeRect(258, 14, 20, 20), "icon-notes",
                function (sender) {
                    commandNote();
                }),
            exportableButton = /*self.*/addButton(NSMakeRect(306, 14, 20, 20), "icon-slice",
                function (sender) {
                    commandExportable();
                }),
            colorsButton = /*self.*/addButton(NSMakeRect(354, 14, 20, 20), "icon-colors",
                function (sender) {
                    commandColor();
                }),
            exportButton = /*self.*/addButton(NSMakeRect(402, 14, 20, 20), "icon-export",
                function (sender) {
                    commandExport();
                }),
            hiddenButton = /*self.*/addButton(NSMakeRect(452, 14, 20, 20), "icon-hidden",
                function (sender) {
                    commandHidden();
                }),
            lockedButton = /*self.*/addButton(NSMakeRect(500, 14, 20, 20), "icon-locked",
                function (sender) {
                    commandLocked();
                }),
            settingsButton = /*self.*/addButton(NSMakeRect(548, 14, 20, 20), "icon-settings",
                function (sender) {
                    commandSettings();
                }),
            divider1 = /*self.*/addImage(NSMakeRect(48, 8, 2, 32), "divider"),
            divider2 = /*self.*/addImage(NSMakeRect(242, 8, 2, 32), "divider"),
            divider3 = /*self.*/addImage(NSMakeRect(436, 8, 2, 32), "divider");

        contentView.addSubview(closeButton);
        contentView.addSubview(overlayButton);
        contentView.addSubview(sizesButton);
        contentView.addSubview(spacingsButton);
        contentView.addSubview(propertiesButton);

        contentView.addSubview(notesButton);
        contentView.addSubview(exportableButton);
        contentView.addSubview(colorsButton);
        contentView.addSubview(exportButton);

        contentView.addSubview(hiddenButton);
        contentView.addSubview(lockedButton);
        contentView.addSubview(settingsButton);

        contentView.addSubview(divider1);
        contentView.addSubview(divider2);
        contentView.addSubview(divider3);

        threadDictionary[identifier] = Toolbar;

        Toolbar.center();
        Toolbar.makeKeyAndOrderFront(nil);
    }
}
