import { context } from "../common/context";
import { logger } from "../common/logger";
import { commandCoordinate, commandOverlays, commandSettings, commandHidden, commandLocked, commandClear, commandSizeMiddle, commandSizeTop, commandSizeBottom, commandSizeLeft, commandSizeCenter, commandSizeRight, commandSpacingVertical, commandSpacingHorizontal, commandSpacingTop, commandSpacingBottom, commandSpacingLeft, commandSpacingRight, commandNote, commandExport } from "../..";
import { localize } from "../common/language";
import { uuidv4, coscriptKeepAround, coscriptNotKeepAround } from "../../webviewPanel/keepAround";
import { Edge, EdgeVertical } from "../../sketch/layer/alignment";
import { markProperties } from "../properties";
import { getResourcePath } from "../helpers/helper";

const keepAroundID = uuidv4();
function getImage(name: string, state?: string) {
    let highDPI = NSScreen.mainScreen().backingScaleFactor() > 1;
    state = state || "normal";
    let size = highDPI ? "@2x" : "";
    let iconPath = getResourcePath() + "/panel/icons/";
    let img = NSURL.fileURLWithPath("" + iconPath + name + "-" + state + size + ".png");
    return NSImage.alloc().initWithContentsOfURL(img)
}
function addImage(rect, name) {
    let view = NSImageView.alloc().initWithFrame(rect),
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
    if (tooltip) button.setToolTip(localize(tooltip));
    return button;
}
function addCheckbox(rect: any, name: string, checked: boolean, callAction: Function) {
    let checkbox = NSButton.alloc().initWithFrame(rect);
    let attr = NSMutableAttributedString.alloc().init();
    checked = checked || false;
    attr.appendString_attributes(localize(name), {});
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
    const WIN_WIDTH = 136, WIN_HEIGHT = 524;
    let identifier = "co.jebbs.sketch-meaxure.toolbar",
        threadDictionary = NSThread.mainThread().threadDictionary(),
        Toolbar = threadDictionary[identifier];
    if (Toolbar) return;

    coscriptKeepAround(keepAroundID);
    Toolbar = NSPanel.alloc().init();
    Toolbar.setStyleMask(NSTitledWindowMask + NSFullSizeContentViewWindowMask);
    Toolbar.setBackgroundColor(NSColor.colorWithRed_green_blue_alpha(0.98, 0.98, 0.98, 1));
    Toolbar.setTitleVisibility(NSWindowTitleHidden);
    Toolbar.setTitlebarAppearsTransparent(true);

    Toolbar.setFrame_display(NSMakeRect(0, 0, WIN_WIDTH, WIN_HEIGHT), false);
    Toolbar.setMovableByWindowBackground(true);
    Toolbar.becomeKeyWindow();
    Toolbar.setLevel(NSFloatingWindowLevel);
    let controls: any[] = [];
    let contentView = Toolbar.contentView();

    // close button
    controls.push(
        addButton(
            NSMakeRect(12, WIN_HEIGHT - 24, 12, 12), null, "close", "normal",
            function (sender) {
                coscriptNotKeepAround(keepAroundID);
                threadDictionary.removeObjectForKey(identifier);
                Toolbar.close();
            }
        )
    );

    let [makeRect, newLine, newSection] = getUIHelpers(WIN_WIDTH, WIN_HEIGHT, 60);

    controls.push(
        addButton(
            makeRect(), "Coordinate", "coordinate", "normal",
            () => commandCoordinate()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Overlay", "overlay", "normal",
            () => commandOverlays()
        )
    );
    newSection();
    controls.push(
        addButton(
            makeRect(), "Top Width", "width-top", "normal",
            () => commandSizeTop()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Middle Width", "width-middle", "normal",
            () => commandSizeMiddle()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Bottom Width", "width-bottom", "normal",
            () => commandSizeBottom()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Left Height", "height-left", "normal",
            () => commandSizeLeft()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Center Height", "height-center", "normal",
            () => commandSizeCenter()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Right Height", "height-right", "normal",
            () => commandSizeRight()
        )
    );
    newSection();
    controls.push(
        addButton(
            makeRect(), "Verticaly Distance", "vertical-distance", "normal",
            () => commandSpacingVertical()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Top Spacing", "spacing-top", "normal",
            () => commandSpacingTop()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Bottom Spacing", "spacing-bottom", "normal",
            () => commandSpacingBottom()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Horizontaly Distance", "horizontal-distance", "normal",
            () => commandSpacingHorizontal()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Left Spacing", "spacing-left", "normal",
            () => commandSpacingLeft()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Right Spacing", "spacing-right", "normal",
            () => commandSpacingRight()
        )
    );
    newSection();
    controls.push(
        addButton(
            makeRect(), "Label on top", "properties-top", "normal",
            () => markProperties(EdgeVertical.top)
        )
    );
    controls.push(
        addButton(
            makeRect(), "Label on right", "properties-right", "normal",
            () => markProperties(Edge.right)
        )
    );
    controls.push(
        addButton(
            makeRect(), "Make Note", "create-note", "normal",
            () => commandNote()
        )
    );
    controls.push(
        addButton(
            makeRect(), "Label on bottom", "properties-bottom", "normal",
            () => markProperties(EdgeVertical.bottom)
        )
    );
    controls.push(
        addButton(
            makeRect(), "Label on left", "properties-left", "normal",
            () => markProperties(Edge.left)
        )
    );
    newLine();
    controls.push(
        addCheckbox(
            makeRect(140, 16), "Influence", context.configs.byInfluence,
            e => context.configs.byInfluence = e.state()
        )
    );
    controls.push(
        addCheckbox(
            makeRect(140, 16), "Percentage", context.configs.byPercentage,
            e => context.configs.byPercentage = e.state()
        )
    );
    newSection();
    controls.push(
        addButton(
            makeRect(24, 24), "Toggle Hidden", "hidden", "normal",
            () => commandHidden()
        )
    );
    controls.push(
        addButton(
            makeRect(24, 24), "Toggle Locked", "locked", "normal",
            () => commandLocked()
        )
    );
    controls.push(
        addButton(
            makeRect(24, 24), "Clean Marks", "clear", "normal",
            () => commandClear()
        )
    );
    controls.push(
        addButton(
            makeRect(24, 24), "Export", "export", "normal",
            () => commandExport()
        )
    );
    controls.push(
        addButton(
            makeRect(24, 24), "Settings", "settings", "normal",
            () => commandSettings()
        )
    );
    //     divider = addImage(NSMakeRect(48, 8, 2, 32), "divider"),
    controls.forEach(c => contentView.addSubview(c));
    threadDictionary[identifier] = Toolbar;

    Toolbar.center();
    Toolbar.makeKeyAndOrderFront(nil);

}

function getUIHelpers(
    winWidth: number, winHeight: number, titleHeight: number,
    margin: number = 8, padding: number = 12, space: number = 24
) {
    let posY = winHeight - titleHeight - padding;
    let posX = padding;
    let lastHeight = 0;
    return [makeRect, newLine, newSection];
    function makeRect(width: number = 32, height: number = 32) {
        let rect = NSMakeRect(posX, posY, width, height);
        // calculate next btn postion
        if (height > lastHeight) lastHeight = height;
        posX += width + margin;
        if (posX + width > winWidth - padding) {
            // new row
            posX = padding;
            posY -= (lastHeight + margin);
            lastHeight = 0;
        }
        return rect;
    }
    function newSection() {
        if (posX == padding) {
            // now in new row
            posY += margin;
            posY -= space;
            return;
        }
        posX = padding;
        posY -= lastHeight;
        posY -= space;
        lastHeight = 0;
    }
    function newLine() {
        if (posX == padding) {
            return;
        }
        posX = padding;
        posY -= (lastHeight + margin);
        lastHeight = 0;
    }
}