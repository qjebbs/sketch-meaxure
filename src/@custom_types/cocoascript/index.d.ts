
declare var nil;
declare var NSUUID;
declare var NSHeight;
declare var NSObject;
declare var MOClassDescription;
declare function NSClassFromString(string);
declare function NSSelectorFromString(string);
declare function NSMakePoint(x: number, y: number);
declare function NSMakeSize(width: number, height: number);
declare function NSMakeRect(x: number, y: number, width: number, height: number);

declare namespace NSString {
    function stringWithContentsOfFile_encoding_error(...args);
}

declare namespace NSColor {
    function colorWithRed_green_blue_alpha(r, g, b, a);
}

declare namespace NSThread {
    function mainThread();
}

declare namespace NSPanel {
    function alloc();
}
declare var NSWindowTitleHidden;
declare var NSWindowCloseButton;
declare var NSWindowMiniaturizeButton;
declare var NSWindowZoomButton;
declare var NSFloatingWindowLevel;

declare namespace WebView {
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
}

declare namespace NSApp {
    function stopModal();
    function runModalForWindow(panel);
}

declare namespace NSWorkspace {
    function sharedWorkspace();
}

declare interface FileManager {
    fileExistsAtPath(path: string): boolean;
}

declare namespace NSFileManager {
    function defaultManager(): FileManager;
}