import { initialize, PlaygroundContext, context, sketch } from "./context";
import { selectLayers } from "./selection";
import { And, Test, Or, Not } from "./selection/bools";

export function run(ctx: PlaygroundContext) {
    initialize(ctx);
    // select locked MeaXure markers in current page
    selectLayers(
        And(
            Test(layer => layer.name.startsWith('#meaxure')),
            Test(layer => layer.locked)
        ),
        context.page
    );
}