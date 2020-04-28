import { sketch } from "../sketch";
import { context } from "./common/context";
import { PlaygroundContext } from "../playground/context";

export function runScript() {
    if (!context.sketchObject.script) return;
    let script = decodeURIComponent(context.sketchObject.script);
    try {
        let ctx = <PlaygroundContext>{
            sketch: sketch,
            context: context,
        }
        let exports = eval(script);
        if (exports['onInit']) {
            exports['onInit'](ctx);
        }
        exports['run'](ctx);
    } catch (error) {
        console.error(error);
    }
}