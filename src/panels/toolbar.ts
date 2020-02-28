import { context } from "../state/context";
import { message } from "../api/helper";
import { logger } from "../api/logger";
import { commandCoordinate, commandOverlays, commandProperties, commandSettings, commandHidden, commandLocked, commandClear, commandExportable, commandSizeMiddle, commandSizeTop, commandSizeBottom, commandSizeLeft, commandSizeCenter, commandSizeRight } from "..";

function getImage(name: string, state?: string) {
    var highDPI = NSScreen.mainScreen().backingScaleFactor() > 1,
        state = state || "normal",
        size = highDPI ? "@2x" : "",
        iconPath = context.resourcesRoot + "/panel/icons/",
        img = NSURL.fileURLWithPath("" + iconPath + name + "-" + state + size + ".png");
    return NSImage.alloc().initWithContentsOfURL(img)
}
function addImage(rect, name) {
    var view = NSImageView.alloc().initWithFrame(rect),
        image = getImage(rect.size, name);
    view.setImage(image);
    return view;
}
function addButton(rect, tooltip, iconName, iconState, callAction: Function) {
    let button = NSButton.alloc().initWithFrame(rect);
    let image = getImage(iconName, iconState);
    let callback = () => {
        try {
            callAction();
        } catch (error) {
            logger.error(error);
        }
    }
    button.setImage(image);
    button.setBordered(false);
    button.sizeToFit();
    button.setButtonType(NSMomentaryChangeButton);

    button.setCOSJSTargetFunction(callback);
    button.setAction("callAction:");
    if (tooltip) button.setToolTip(tooltip);
    return button;
}
function addCheckbox(rect: any, name: string, checked: boolean, callAction: Function) {
    let checkbox = NSButton.alloc().initWithFrame(rect);
    let attr = NSMutableAttributedString.alloc().init();
    checked = checked || false;
    attr.appendString_attributes(name, {});
    let range = NSMakeRange(0, attr.length());
    attr.addAttribute_value_range(NSForegroundColorAttributeName, NSColor.colorWithRed_green_blue_alpha(.29, .29, .29, 1), range);
    attr.addAttribute_value_range(NSFontAttributeName, NSFont.systemFontOfSize(14), range);
    checkbox.setButtonType(NSSwitchButton);
    checkbox.setState(checked);
    checkbox.setAttributedTitle(attr);
    checkbox.setCOSJSTargetFunction(callAction);
    checkbox.setAction("callAction:");
    return checkbox
}
export function markToolbar() {
    var identifier = "co.jebbs.measure",
        threadDictionary = NSThread.mainThread().threadDictionary(),
        Toolbar = threadDictionary[identifier];
    if (Toolbar) return;

    coscript.setShouldKeepAround(true);
    Toolbar = NSPanel.alloc().init();
    Toolbar.setStyleMask(NSTitledWindowMask + NSFullSizeContentViewWindowMask);
    Toolbar.setBackgroundColor(NSColor.colorWithRed_green_blue_alpha(0.98, 0.98, 0.98, 1));
    Toolbar.setTitleVisibility(NSWindowTitleHidden);
    Toolbar.setTitlebarAppearsTransparent(true);

    Toolbar.setFrame_display(NSMakeRect(0, 0, 160, 582), false);
    Toolbar.setMovableByWindowBackground(true);
    Toolbar.becomeKeyWindow();
    Toolbar.setLevel(NSFloatingWindowLevel);
    let controls: any[] = [];
    var contentView = Toolbar.contentView();

    controls.push(
        addButton(
            NSMakeRect(12, 558, 12, 12), null, "close", "normal",
            function (sender) {
                coscript.setShouldKeepAround(false);
                threadDictionary.removeObjectForKey(identifier);
                Toolbar.close();
            }
        )
    );
    controls.push(
        addButton(
            NSMakeRect(20, 494, 32, 32), "Coordinate", "coordinate", "normal",
            () => commandCoordinate()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(60, 494, 32, 32), "Overlay", "overlay", "normal",
            () => commandOverlays()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(100, 494, 32, 32), "Make Exportable", "create-slice", "normal",
            () => commandExportable()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(20, 420, 32, 32), "Top Width", "width-top", "normal",
            () => commandSizeTop()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(60, 420, 32, 32), "Middle Width", "width-middle", "normal",
            () => commandSizeMiddle()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(100, 420, 32, 32), "Bottom Width", "width-bottom", "normal",
            () => commandSizeBottom()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(20, 380, 32, 32), "Left Height", "height-left", "normal",
            () => commandSizeLeft()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(60, 380, 32, 32), "Center Height", "height-center", "normal",
            () => commandSizeCenter()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(100, 380, 32, 32), "Right Height", "height-right", "normal",
            () => commandSizeRight()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(20, 306, 32, 32), "Verticaly Distance", "vertical-distance", "normal",
            function () {
                message('Mark.spacings("vertical")')
            }
        )
    );
    controls.push(
        addButton(
            NSMakeRect(20, 266, 32, 32), "Horizontaly Distance", "horizontal-distance", "normal",
            function () {
                message('Mark.spacings("horizontal")')
            }
        )
    );
    controls.push(
        addButton(
            NSMakeRect(68, 306, 32, 32), "Top Spacing", "spacing-top", "normal",
            function () {
                message('Mark.spacings("top")')
            }
        )
    );
    controls.push(
        addButton(
            NSMakeRect(108, 306, 32, 32), "Bottom Spacing", "spacing-bottom", "normal",
            function () {
                message('Mark.spacings("bottom")')
            }
        )
    );
    controls.push(
        addButton(
            NSMakeRect(68, 266, 32, 32), "Left Spacing", "spacing-left", "normal",
            function () {
                message('Mark.spacings("left")')
            }
        )
    );
    controls.push(
        addButton(
            NSMakeRect(108, 266, 32, 32), "Right Spacing", "spacing-right", "normal",
            function () {
                message('Mark.spacings("right")')
            }
        )
    );
    controls.push(
        addButton(
            NSMakeRect(20, 192, 32, 32), "Label on top", "properties-top", "normal",
            () => (context.runningConfig.placement = "top") && commandProperties(null)
        )
    );
    controls.push(
        addButton(
            NSMakeRect(60, 192, 32, 32), "Label on right", "properties-right", "normal",
            () => (context.runningConfig.placement = "right") && commandProperties(null)
        )
    );
    controls.push(
        addButton(
            NSMakeRect(20, 152, 32, 32), "Label on bottom", "properties-bottom", "normal",
            () => (context.runningConfig.placement = "bottom") && commandProperties(null)
        )
    );
    controls.push(
        addButton(
            NSMakeRect(60, 152, 32, 32), "Label on left", "properties-left", "normal",
            () => (context.runningConfig.placement = "left") && commandProperties(null)
        )
    );
    controls.push(
        addCheckbox(
            NSMakeRect(20, 102, 140, 16), "Influence", context.configs.byInfluence,
            e => context.configs.byInfluence = e.state()
        )
    );
    controls.push(
        addCheckbox(
            NSMakeRect(20, 77, 140, 16), "Percentage", context.configs.byPercentage,
            e => context.configs.byPercentage = e.state()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(20, 20, 24, 24), "Toggle Hidden", "hidden", "normal",
            () => commandHidden()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(52, 20, 24, 24), "Toggle Locked", "locked", "normal",
            () => commandLocked()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(84, 20, 24, 24), "Clean Marks", "clear", "normal",
            () => commandClear()
        )
    );
    controls.push(
        addButton(
            NSMakeRect(116, 20, 24, 24), "Settings", "settings", "normal",
            () => commandSettings()
        )
    );
    //     divider1 = addImage(NSMakeRect(48, 8, 2, 32), "divider"),
    //     divider2 = addImage(NSMakeRect(242, 8, 2, 32), "divider"),
    //     divider3 = addImage(NSMakeRect(436, 8, 2, 32), "divider");
    controls.forEach(c => contentView.addSubview(c));
    threadDictionary[identifier] = Toolbar;

    Toolbar.center();
    Toolbar.makeKeyAndOrderFront(nil);

}
