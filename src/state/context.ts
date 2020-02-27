import { initLanguage } from "./language";
import * as path from '@skpm/path';
import { extend } from "../api/helper";
import { ConfigsMaster } from "../api/config";
import { logger } from "../api/logger";

interface RunningConfig {
    order: string;
    exportInfluenceRect: boolean;
    exportOption: boolean;
    colors: any;
    sizes: any;
    spacings: any;
    properties: any;
    isHidden: boolean;
    isLocked: boolean;
    placement: string;
}

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
    configs: ConfigsMaster;
    runningConfig: RunningConfig;
    languageData: string;

    // TODO: move to runningConfig
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

export function updateContext(ctx?) {
    if (!ctx && !context) throw new Error("Context not initialized");
    let notInitilized = context === undefined;
    // initialized the context
    if (!context && ctx) {
        logger.debug("initContextRunOnce");
        context = <markContext>{};
        initContextRunOnce(ctx)
    }
    logger.debug("Update context");
    if (ctx) extend(ctx, context);
    // current document either from ctx or NSDocumentController
    let document = (ctx ? ctx.document : undefined) || NSDocumentController.sharedDocumentController().currentDocument();
    if (notInitilized || document != context.document) {
        // properties updates only when document change
        logger.debug("Update target document");
        context.document = document
        context.configs = new ConfigsMaster(document);
        context.documentData = context.document.documentData();
        context.UIMetadata = context.document.mutableUIMetadata();
        context.window = context.document.window();
    }
    // properties always need to update
    context.pages = context.document.pages();
    context.page = context.document.currentPage();
    context.artboard = context.page.currentArtboard();
    context.current = context.artboard || context.page;
    context.selection = context.document.selectedLayers().layers();
    return context;
}

function initContextRunOnce(ctx) {
    context.prefs = NSUserDefaults.standardUserDefaults();
    // context.version = context.plugin.version() + "";
    context.SMVersion = context.prefs.stringForKey("SMVersion") + "" || "0";
    context.SMLanguage = context.prefs.stringForKey("SMLanguage") + "" || "0";
    context.resourcesRoot = path.resourcePath("");
    context.languageData = initLanguage();
    context.runningConfig = <RunningConfig>{};
}