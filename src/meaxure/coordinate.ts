// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { context } from "./common/context";
import { localize } from "./common/language";
import { sketch } from "../sketch";
import { createLabel } from "./helpers/elements";
import { Edge, EdgeVertical } from "../sketch/layer/alignment";
import { lengthUnit } from "./helpers/helper";
import { ResizingConstraint } from "../sketch/layer/resizingConstraint";

export function drawCoordinate() {
    if (context.selection.length <= 0) {
        sketch.UI.message(localize("Select any layer to mark!"));
        return false;
    }
    for (let layer of context.selection.layers) {
        coordinateLayer(layer);
    }
}
function coordinateLayer(layer: Layer) {
    let layerID = layer.id;
    let layerName = "#meaxure-coordinate-" + layerID;
    let artboard = layer.getParentArtboard();
    let root = artboard || layer.getParentPage();
    if (!root) return;
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    let layerRect = context.configs.byInfluence ? layer.frameInfluence : layer.frame;
    let artboardRect = context.configs.byInfluence ? root.frameInfluence : root.frame;
    if (artboard) {
        layerRect = layerRect.changeBasis({ from: layer.parent as Group, to: artboard });
        artboardRect = artboardRect.changeBasis({ from: artboard.parent as Group, to: artboard });
    }

    let container = new sketch.Group({ name: layerName, parent: root });
    let cross = new sketch.Group({ name: 'cross', parent: container });
    let crossX = new sketch.ShapePath({ parent: cross });
    crossX.frame.width = 17;
    crossX.frame.height = 1;
    crossX.sharedStyle = context.meaxureStyles.coordinate.background;
    crossX.style = context.meaxureStyles.coordinate.background.style;
    let crossY = crossX.duplicate();
    crossY.transform.rotation = 90;
    crossY.alignToByPostion(crossX, Edge.center);
    cross.adjustToFit();

    let posX = lengthUnit(layerRect.x - artboardRect.x);
    let posY = lengthUnit(layerRect.y - artboardRect.y);
    let text = posX + ", " + posY;
    let label = createLabel(text, {
        parent: container,
        name: 'label',
        foreground: context.meaxureStyles.coordinate.foreground,
        background: context.meaxureStyles.coordinate.background
    });
    label.alignTo(cross,
        { from: Edge.left, to: Edge.center },
        { from: EdgeVertical.top, to: EdgeVertical.middle }
    );
    label.frame.offset(2, 2);

    cross.resizingConstraint = ResizingConstraint.width &
        ResizingConstraint.height &
        ResizingConstraint.left &
        ResizingConstraint.top;
    label.resizingConstraint = cross.resizingConstraint;

    container.adjustToFit();
    container.frame.x = layerRect.x - 8;
    container.frame.y = layerRect.y - 8;
}

