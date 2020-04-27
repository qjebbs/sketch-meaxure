import { sketch } from "../sketch";
import { context } from "./common/context";
import { PlaygroundContext } from "../playground/context";

export function runScript() {
    if (!context.sketchObject.script) return;
    let script = decodeURIComponent(context.sketchObject.script);
    try {
        let exports = eval(script);
        exports['run'](<PlaygroundContext>{
            sketch: sketch,
            context: context,
        });
    } catch (error) {
        console.error(error);
    }
}