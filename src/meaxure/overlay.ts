// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { localize } from "./common/language";
import { context } from "./common/context";
import { sketch } from "../sketch";
import { ResizingConstraint } from "../sketch/layer/resizingConstraint";
export function markOverlays() {
    let selection = context.selection;
    if (selection.length <= 0) {
        sketch.UI.message(localize("Select a layer to mark!"));
        return false;
    }
    for (let layer of selection.layers) {
        overlay(layer)
    }
}

function overlay(target: Layer) {
    let name = "#meaxure-overlay-" + target.id;
    let artboard = target.getParentArtboard();
    let root = artboard || target.getParentPage();
    if (!root) return;
    sketch.find<Group>(
        `Group, [name="${name}"]`,
        root
    ).forEach(g => g.remove());

    let overlayStyle = context.meaxureStyles.overlay.background;
    let container = new sketch.Group({ name: name, parent: root })
    let overlay = new sketch.ShapePath({ name: 'overlay', parent: container });
    overlay.frame = target.frame.changeBasis({ from: target.parent as Layer, to: root });;
    overlay.sharedStyle = overlayStyle;
    overlay.style = overlayStyle.style;
    overlay.resizingConstraint = ResizingConstraint.top &
        ResizingConstraint.bottom &
        ResizingConstraint.left &
        ResizingConstraint.right;
    container.adjustToFit();
}