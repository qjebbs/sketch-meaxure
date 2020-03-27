import { localize } from "../state/language";
import { find, mathHalf } from "../api/helper";
import { colors } from "../state/common";
import { getRect, is, addGroup, addShape, addText, removeLayer } from "../api/api";
import { context } from "../state/context";
import { sharedLayerStyle, sharedTextStyle } from "./base";
import { sketch } from "../sketch";

export function markNote() {
    let selection = context.selection;

    if (selection.count() <= 0) {
        sketch.UI.message(localize("Select a text layer to mark!"));
        return false;
    }

    let target = selection[0];

    if (/#note-/.exec(target.parentGroup().name()) && is(target, MSTextLayer)) {
        resizeNote(target.parentGroup());
    } else {
        for (let i = 0; i < selection.count(); i++) {
            let target = selection[i];
            if (is(target, MSTextLayer)) {
                note(target);
            }
        }
    }
}
function note(target) {
    let targetRect = getRect(target),
        objectID = target.objectID(),
        noteStyle = {
            layer: sharedLayerStyle("Sketch Measure / Note", colors.note.shape, colors.note.border),
            text: sharedTextStyle("Sketch Measure / Note", colors.note.text)
        }
    let container = addGroup();

    context.current.addLayers([container]);
    container.setName("#note-" + new Date().getTime());

    let note = addShape(),
        text = addText();

    container.addLayers([note, text]);

    note.setName("note-box");
    note.layers().firstObject().setCornerRadiusFromComponents("2")

    text.setStringValue(target.stringValue());
    text.setTextBehaviour(1);
    text.setTextBehaviour(0);
    note.setSharedStyle(noteStyle.layer);
    text.setSharedStyle(noteStyle.text);

    let noteRect = getRect(note),
        textRect = getRect(text),
        fontSize = text.fontSize(),
        scale = fontSize / 12;

    if (textRect.width > 160 * scale) {
        text.setTextBehaviour(1);
        textRect.setWidth(160 * scale);
        text.finishEditing();
        textRect = getRect(text);
    }

    textRect.setX(targetRect.x);
    textRect.setY(targetRect.y);
    noteRect.setX(textRect.x - 6 * scale);
    noteRect.setY(textRect.y - 6 * scale);
    noteRect.setWidth(textRect.width + 12 * scale);
    noteRect.setHeight(textRect.height + 12 * scale);

    container.fixGeometryWithOptions(0);
    removeLayer(target);
}

function resizeNote(container) {
    let text = find({
        key: "(class != NULL) && (class == %@)",
        match: MSTextLayer
    }),
        label = find({
            key: "(name != NULL) && (name == %@)",
            match: "note-box"
        }),
        textRect = getRect(text),
        labelRect = getRect(label),
        oldWidth = labelRect.width,
        oldHeight = labelRect.height,
        newWidth = textRect.width + 12,
        newHeight = textRect.height + 12,
        dWidth = newWidth - oldWidth,
        dHeight = newHeight - oldHeight;

    if (!dWidth && !dHeight) return false;

    labelRect.setX(labelRect.x - mathHalf(dWidth));
    labelRect.setY(labelRect.y - mathHalf(dHeight));
    labelRect.setWidth(newWidth);
    labelRect.setHeight(newHeight);

    textRect.setX(textRect.x - mathHalf(dWidth));
    textRect.setY(textRect.y - mathHalf(dHeight));

    text.setTextBehaviour(1);
    text.setTextBehaviour(0);

    container.fixGeometryWithOptions(0);
}