import { getConfigs, MarkConfig } from "./config";
import { initLanguage } from "./language";
import * as path from '@skpm/path';
import { extend } from "../helper";

interface markContext {
    // sketch
    document: any;
    prefs: any;
    // meaxure
    SMVersion: string;
    SMLanguage: string;
    resourcesRoot: string;
    documentData: any;
    UIMetadata: any;
    window: any;
    page: any;
    pages: any;
    artboard: any;
    current: any;
    selection: any;
    configs: MarkConfig;
    languageData: string;

    selectionArtboards: any;
    artboardsData: any[];
    allCount: number; // exporting layers count
    allData: any; //export page data
    slices: any[];
    sliceCache: any;
    maskCache: any[];
    wantsStop: boolean;
    maskObjectID: any;
    maskRect: any;
    savePath: string;
    assetsPath: string;
}

export let context: markContext = undefined;
function initContext(ctx) {
    context = extend(ctx, {});
    context.prefs = NSUserDefaults.standardUserDefaults();
    // context.version = context.plugin.version() + "";
    // context.language = lang;
    context.SMVersion = context.prefs.stringForKey("SMVersion") + "" || "0";
    context.SMLanguage = context.prefs.stringForKey("SMLanguage") + "" || "0";
    // context.pluginRoot = context.scriptPath;
    context.resourcesRoot = path.resourcePath("");

    // context.extend(context);
    // coscript.setShouldKeepAround(true);
    context.documentData = context.document.documentData();
    context.UIMetadata = context.document.mutableUIMetadata();
    context.window = context.document.window();
    context.pages = context.document.pages();
    context.page = context.document.currentPage();
    context.artboard = context.page.currentArtboard();
    context.current = context.artboard || context.page;
    context.configs = getConfigs();
     context.languageData = initLanguage();

    return context;
}

export function initOrUpdateContext(ctx?) {
    if (!ctx && !context) throw new Error("Context not initialized");
    // initialized the context
    if (ctx) return initContext(ctx);
    // update the context
    context.document = NSDocumentController.sharedDocumentController().currentDocument();
    context.selection = context.document.selectedLayers().layers();
    return context;
}