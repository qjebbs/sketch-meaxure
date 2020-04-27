import { initialize, PlaygroundContext, context, sketch } from "./context";
import { selectLayersByLibrary } from "./selection";

export function run(ctx: PlaygroundContext) {
    initialize(ctx);
    // selectLayersByLibrary(context.document, 'le');
    sketch.UI.message(context.document.fileName);
}