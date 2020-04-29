import { SMContext } from "../meaxure/common/context";

export interface PlaygroundContext {
    sketch: Sketch,
    context: SMContext,
}
export let sketch: Sketch = undefined;
export let context: SMContext = undefined;

export function initialize(ctx: PlaygroundContext): void {
    sketch = ctx.sketch;
    context = ctx.context;
}
