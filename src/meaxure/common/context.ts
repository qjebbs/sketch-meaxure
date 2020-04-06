import { initLanguage } from "./language";
import * as path from '@skpm/path';
import { ConfigsMaster } from "./config";
import { sketch } from "../../sketch";
import { Edge, EdgeVertical } from "../../sketch/layer/alignment";
import { MeaxureStyles } from "../meaxureStyles";

interface RunningConfig {
    order: string;
    exportInfluenceRect: boolean;
    exportOption: boolean;
    colors: any;
    sizes: any;
    placement: Edge | EdgeVertical; //property placement
}

interface Context {
    document: any;
    selection: any;
    scriptPath: string;
    api(): any;
}

interface SMContext {
    sketchObject: Context;
    document: Document;
    selection: Selection;
    resourcesRoot: string;
    page: Page;
    artboard: Artboard;
    current: Artboard | Page;
    configs: ConfigsMaster;
    runningConfig: RunningConfig;
    languageData: string;
    meaxureStyles: MeaxureStyles;
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
    if (ctx) context.sketchObject = ctx;
    // current document either from ctx or NSDocumentController
    let document = (ctx ? ctx.document : undefined) || NSDocumentController.sharedDocumentController().currentDocument();
    if (notInitilized || document != context.sketchObject.document) {
        // properties updates only when document change
        // logger.debug("Update target document");
        context.sketchObject.document = document;
        context.document = sketch.Document.fromNative(context.sketchObject.document);
        context.configs = new ConfigsMaster(document);
    }
    if (document) {
        // properties always need to update
        context.page = context.document.selectedPage;
        context.artboard = sketch.Artboard.fromNative(context.page.sketchObject.currentArtboard());
        context.current = context.artboard || context.page;
        context.selection = context.document.selectedLayers;
        context.meaxureStyles = new MeaxureStyles(context.document);
    }
    return context;
}

function initContextRunOnce() {
    context.resourcesRoot = path.resourcePath("");
    context.languageData = initLanguage();
    context.runningConfig = <RunningConfig>{};
}