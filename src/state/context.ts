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
    placement: string; //property placement
}

interface Context {
    document: any;
    selection: any;
    scriptPath: string;
    api(): any;
}

interface SMContext extends Context {
    resourcesRoot: string;
    page: any;
    artboard: any;
    current: any;
    configs: ConfigsMaster;
    runningConfig: RunningConfig;
    languageData: string;
}

export let context: SMContext = undefined;

export function updateContext(ctx?: Context) {
    if (!ctx && !context) throw new Error("Context not initialized");
    let notInitilized = context === undefined;
    // initialized the context
    if (!context && ctx) {
        // logger.debug("initContextRunOnce");
        context = <SMContext>{};
        initContextRunOnce()
    }
    // logger.debug("Update context");
    if (ctx) extend(ctx, context);
    // current document either from ctx or NSDocumentController
    let document = (ctx ? ctx.document : undefined) || NSDocumentController.sharedDocumentController().currentDocument();
    if (notInitilized || document != context.document) {
        // properties updates only when document change
        // logger.debug("Update target document");
        context.document = document
        context.configs = new ConfigsMaster(document);
    }
    // properties always need to update
    context.page = context.document.currentPage();
    context.artboard = context.page.currentArtboard();
    context.current = context.artboard || context.page;
    context.selection = context.document.selectedLayers().layers();
    return context;
}

function initContextRunOnce() {
    context.resourcesRoot = path.resourcePath("");
    context.languageData = initLanguage();
    context.runningConfig = <RunningConfig>{};
}