declare interface CocoaScriptObject {
    setShouldKeepAround(flag: boolean);
    scheduleWithRepeatingInterval_jsFunction(interval: number, callback: Function);
}
declare const coscript: CocoaScriptObject;

declare const nil;
declare const NSUUID;
declare const NSHeight;
declare const NSObject;
declare const NSMutableArray
declare const MOClassDescription;
declare function NSClassFromString(string);
declare function NSSelectorFromString(string);
declare function NSMakePoint(x: number, y: number);
declare function NSMakeSize(width: number, height: number);
declare function NSMakeRect(x: number, y: number, width: number, height: number);
declare function NSMakeRange(len: number, cap: number);
declare function CGRectMake(x: number, y: number, width: number, height: number);
declare function NSTemporaryDirectory();
declare namespace NSString {
    function stringWithContentsOfFile_encoding_error(...args);
    function stringWithString(str: string);
    function alloc();
}

declare namespace NSColor {
    function colorWithRed_green_blue_alpha(r, g, b, a);
}

declare namespace NSThread {
    function mainThread();
}

declare namespace NSEvent {
    function modifierFlags();
}
declare namespace NSPanel {
    function alloc();
}
declare const NSWindowTitleHidden;
declare const NSWindowCloseButton;
declare const NSWindowMiniaturizeButton;
declare const NSWindowZoomButton;
declare const NSFloatingWindowLevel;
declare const NSMomentaryChangeButton;
declare const NSTitledWindowMask;
declare const NSFullSizeContentViewWindowMask;
declare const NSAlternateKeyMask;
declare const NSOKButton;
declare const NSForegroundColorAttributeName;
declare const NSFontAttributeName;
declare const NSSwitchButton;

declare const NSEventTypeLeftMouseDown

declare namespace WebView {
    function alloc();
}
declare namespace NSImage {
    function alloc();
}
declare namespace NSImageView {
    function alloc();
}
declare namespace NSButton {
    function alloc();
}

declare namespace NSMutableAttributedString {
    function alloc();
}

declare namespace NSDictionary {
    function dictionaryWithContentsOfFile(string);
}

declare namespace NSUserDefaults {
    function standardUserDefaults();
}

declare namespace NSURL {
    function URLWithString(url: string);
    function fileURLWithPath(path: string);
}

declare namespace NSApp {
    function stopModal();
    function runModalForWindow(panel);
}

declare namespace NSScreen {
    function mainScreen();
}
declare namespace NSFont {
    function systemFontOfSize(size: number);
    function fontWithName_size(name: string, size: number): any;
}

declare namespace NSLayoutManager {
    function alloc();
}

declare namespace NSWorkspace {
    function sharedWorkspace();
}

declare interface FileManager {
    fileExistsAtPath(path: string): boolean;
    createDirectoryAtPath_withIntermediateDirectories_attributes_error(...args);
}

declare namespace NSFileManager {
    function defaultManager(): FileManager;
}
declare namespace NSDocumentController {
    function sharedDocumentController();
}
declare namespace NSPredicate {
    function predicateWithFormat(key: string, match: string);
}
declare namespace NSData {
    function dataWithContentsOfURL(url: string);
}
declare namespace NSSavePanel {
    function savePanel();
}