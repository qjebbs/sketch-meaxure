import { SMContext } from "../src/meaxure/common/context";
import { selectLayersByLibrary } from "./selection";

export let sketch: Sketch = undefined;
export let context: SMContext = undefined;
export function run(sketch: Sketch, context: SMContext) {
    initialize(sketch, context);
    selectLayersByLibrary(context.document, 'le');
}

function initialize(sk: Sketch, ctx: SMContext): void {
    sketch = sk;
    context = ctx;
}