// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from "../../sketch";
import { ConfigsMaster } from "./config";
import { MeaxureStyles } from "../meaxureStyles";

interface Context {
    document: any;
    selection: any;
    scriptPath: string;
}

interface SMContext {
    sketchObject: Context;
    document: Document;
    selection: Selection;
    page: Page;
    artboard: Artboard;
    configs: ConfigsMaster;
    meaxureStyles: MeaxureStyles;
}

export let context: SMContext = undefined;

export function updateContext(ctx?: Context) {
    if (!ctx && !context) throw new Error("Context not initialized");
    let notInitilized = context === undefined;
    // initialized the context
    if (!context && ctx) {
        // logger.debug("initContextRunOnce");
        initContextRunOnce();
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
        context.selection = context.document.selectedLayers;
        context.meaxureStyles = new MeaxureStyles(context.document);
    }
    return context;
}

function initContextRunOnce() {
    context = <SMContext>{};
}