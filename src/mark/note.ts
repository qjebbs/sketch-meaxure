import { localize } from "../state/language";
import { message, find, mathHalf } from "../api/helper";
import { colors } from "../state/common";
import { getRect, is, addGroup, addShape, addText, removeLayer } from "../api/api";
import { context } from "../state/context";
import { sharedLayerStyle, sharedTextStyle } from "./base";

export function markNote() {
    let selection = /*this.*/context.selection;

    if (selection.count() <= 0) {
        /*this.*/message(localize("Select a text layer to mark!"));
        return false;
    }

    let target = selection[0];

    if (/#note-/.exec(target.parentGroup().name()) && /*this.*/is(target, MSTextLayer)) {
        /*this.*/resizeNote(target.parentGroup());
    } else {
        for (let i = 0; i < selection.count(); i++) {
            let target = selection[i];
            if (/*this.*/is(target, MSTextLayer)) {
                /*this.*/note(target);
            }
        }
    }
}
function note(target) {
    let targetRect = /*this.*/getRect(target),
        objectID = target.objectID(),
        noteStyle = {
            layer: /*this.*/sharedLayerStyle("Sketch Measure / Note", /*this.*/colors.note.shape, /*this.*/colors.note.border),
            text: /*this.*/sharedTextStyle("Sketch Measure / Note", /*this.*/colors.note.text)
        }
    let container = /*this.*/addGroup();

    /*this.*/context.current.addLayers([container]);
    container.setName("#note-" + new Date().getTime());

    let note = /*this.*/addShape(),
        text = /*this.*/addText();

    container.addLayers([note, text]);

    note.setName("note-box");
    note.layers().firstObject().setCornerRadiusFromComponents("2")

    text.setStringValue(target.stringValue());
    text.setTextBehaviour(1);
    text.setTextBehaviour(0);
    note.setSharedStyle(noteStyle.layer);
    text.setSharedStyle(noteStyle.text);

    let noteRect = /*this.*/getRect(note),
        textRect = /*this.*/getRect(text),
        fontSize = text.fontSize(),
        scale = fontSize / 12;

    if (textRect.width > 160 * scale) {
        text.setTextBehaviour(1);
        textRect.setWidth(160 * scale);
        text.finishEditing();
        textRect = /*this.*/getRect(text);
    }

    textRect.setX(targetRect.x);
    textRect.setY(targetRect.y);
    noteRect.setX(textRect.x - 6 * scale);
    noteRect.setY(textRect.y - 6 * scale);
    noteRect.setWidth(textRect.width + 12 * scale);
    noteRect.setHeight(textRect.height + 12 * scale);

    container.fixGeometryWithOptions(0);
    /*this.*/removeLayer(target);
}

function resizeNote(container) {
    let text = /*this.*/find({
        key: "(class != NULL) && (class == %@)",
        match: MSTextLayer
    }),
        label = /*this.*/find({
            key: "(name != NULL) && (name == %@)",
            match: "note-box"
        }),
        textRect = /*this.*/getRect(text),
        labelRect = /*this.*/getRect(label),
        oldWidth = labelRect.width,
        oldHeight = labelRect.height,
        newWidth = textRect.width + 12,
        newHeight = textRect.height + 12,
        dWidth = newWidth - oldWidth,
        dHeight = newHeight - oldHeight;

    if (!dWidth && !dHeight) return false;

    labelRect.setX(labelRect.x - /*this.*/mathHalf(dWidth));
    labelRect.setY(labelRect.y - /*this.*/mathHalf(dHeight));
    labelRect.setWidth(newWidth);
    labelRect.setHeight(newHeight);

    textRect.setX(textRect.x - /*this.*/mathHalf(dWidth));
    textRect.setY(textRect.y - /*this.*/mathHalf(dHeight));

    text.setTextBehaviour(1);
    text.setTextBehaviour(0);

    container.fixGeometryWithOptions(0);
}