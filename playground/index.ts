import { SMContext } from "../src/meaxure/common/context";

export function run(sketch: Sketch, context: SMContext) {
    sketch.UI.alert(
        'MeaXure Playground',
        'Hello World!' + '\n' +
        'Current document is ' + context.document.fileName
    );
}