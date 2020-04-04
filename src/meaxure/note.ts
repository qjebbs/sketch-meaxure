import { localize } from "./common/language";
import { colors } from "./common/common";
import { context } from "./common/context";
import { sketch } from "../sketch";
import { createLabel } from "./helpers/elements";
import { sharedLayerStyle, sharedTextStyle } from "./helpers/styles";

export function markNote() {
    let selection = context.selection;

    if (selection.length <= 0) {
        sketch.UI.message(localize("Select a text layer to mark!"));
        return false;
    }
    for (let layer of selection.layers) {
        if (layer.type == sketch.Types.Text) note(layer as Text);
    }
}
function note(target: Text) {
    let background = sharedLayerStyle(context.document, "Sketch MeaXure / Note", colors.note.shape, colors.note.border);
    let foreground = sharedTextStyle(context.document, "Sketch MeaXure / Note", colors.note.text);
    let root = target.getParentArtboard() || target.getParentPage();
    let name = "#note-" + new Date().getTime();

    let note = createLabel(target.text, {
        name: name,
        parent: root,
        foreground: foreground,
        background: background,
    })
    note.alignTo(target, true, true);
    target.remove();
}
