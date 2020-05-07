import { initialize, PlaygroundContext, context, sketch } from "./context";
import { selectLayers } from "./selection";

export var onInit = initialize;
export function run(ctx: PlaygroundContext) {
    // select locked MeaXure markers in current page
    selectLayers(
        layer => layer.name.startsWith('#meaxure') && layer.locked,
        context.page
    );
}