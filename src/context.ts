import { getConfigs } from "./config";
import { logger } from "./logger";
import { initLanguage } from "./language";
import * as path from '@skpm/path';
import { extend } from "./helper";

export let context: any = {};
export function initContext(ctx) {
    extend(ctx, context);
    context.prefs = NSUserDefaults.standardUserDefaults();
    // context.version = context.plugin.version() + "";
    // context.language = lang;
    context.SMVersion = context.prefs.stringForKey("SMVersion") + "" || 0;
    context.SMLanguage = context.prefs.stringForKey("SMLanguage") + "" || 0;
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
    context.language = initLanguage();

    return context;
}
