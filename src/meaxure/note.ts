// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { localize } from "./common/language";
import { context } from "./common/context";
import { sketch } from "../sketch";
import { createLabel } from "./helpers/elements";

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
    let background = context.meaxureStyles.note.background;
    let foreground = context.meaxureStyles.note.foreground;
    let root = target.getParentArtboard() || target.getParentPage();
    if (!root) return;

    let name = "#meaxure-note-" + new Date().getTime();
    let note = createLabel(target.text, {
        name: name,
        parent: root,
        foreground: foreground,
        background: background,
    })
    note.alignTo(target, true, true);
    if (note.frame.width > 100) note.frame.width = 100;
    if (note.frame.height > 100) note.frame.height = 100;
    target.remove();
}
