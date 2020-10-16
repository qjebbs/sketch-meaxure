import { initialize, PlaygroundContext, context, sketch } from "./context";
import { linkColorsToSwatches } from "./swatches";

export var onInit = initialize;
export function run(ctx: PlaygroundContext) {
    // // select locked MeaXure markers in current page
    // selectLayers(
    //     layer => layer.name.startsWith('#meaxure') && layer.locked,
    //     context.page
    // );
    linkColorsToSwatches(lib => lib.name == 'zent')
}
