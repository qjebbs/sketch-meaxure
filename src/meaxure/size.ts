// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { context } from "./common/context";
import { localize } from "./common/language";
import { sketch } from "../sketch";
import { createBubble, createMeter } from "./helpers/elements";
import { Edge, EdgeVertical } from "../sketch/layer/alignment";
import { lengthUnit } from "./helpers/helper";
import { ResizingConstraint } from "../sketch/layer/resizingConstraint";

export function drawSizes(position: Edge | EdgeVertical) {
    if (context.selection.length <= 0) {
        sketch.UI.message(localize("Select any layer to mark!"));
        return false;
    }
    position = position || EdgeVertical.top;
    for (let layer of context.selection.layers) {
        drawSize(layer, position);
    }
}

function drawSize(layer: Layer, position: Edge | EdgeVertical): void {
    let sizeType = position === EdgeVertical.top ||
        position === EdgeVertical.middle ||
        position === EdgeVertical.bottom ?
        "width" : "height";
    let name = "#meaxure-" + sizeType + "-" + position + "-" + layer.id;
    let artboard = layer.getParentArtboard();
    let root = artboard || layer.getParentPage();
    if (!root) return;
    sketch.find<Group>(
        `Group, [name="${name}"]`,
        root
    ).forEach(g => g.remove());
    let frame = context.configs.byInfluence ? layer.frameInfluence : layer.frame;
    drawSizeForFrame(frame, position, {
        name: name,
        parent: root,
        background: context.meaxureStyles.size.background,
        foreground: context.meaxureStyles.size.foreground,
    });
}


export function drawSizeForFrame(
    frame: Rectangle,
    position: Edge | EdgeVertical,
    options: {
        name: string,
        parent: Group,
        background: SharedStyle,
        foreground: SharedStyle,
    }
): void {
    let isHorizontal = position === EdgeVertical.top ||
        position === EdgeVertical.middle ||
        position === EdgeVertical.bottom;
    let size: number;
    let text: string;
    size = isHorizontal ? frame.width : frame.height;
    text = lengthUnit(size);
    if (context.configs.byPercentage && options.parent.type != sketch.Types.Page) {
        let containerFrame = context.configs.byInfluence ? options.parent.frameInfluence : options.parent.frame;
        let containerSize = isHorizontal ? containerFrame.width : containerFrame.height;
        text = lengthUnit(size, containerSize)
    }
    let container = new sketch.Group({ name: options.name, parent: options.parent });
    let meter = createMeter(size, {
        name: 'meter',
        parent: container,
        background: options.background,
        isHorizontal: isHorizontal,
    })
    let bubblePosition = calcBubblePosition(position);
    let bubble = createBubble(text, {
        name: 'label',
        parent: container,
        foreground: options.foreground,
        background: options.background,
        bubblePosition: bubblePosition,
    })
    meter.alignToByPostion(
        // expand the frame so that the meter offsets to target by 1px;
        new sketch.Rectangle(frame.x - 1, frame.y - 1, frame.width + 2, frame.height + 2),
        position
    );
    if (bubblePosition == Edge.left || bubblePosition == Edge.center || bubblePosition == Edge.right) {
        bubble.alignTo(
            meter,
            { from: getCounterEdge(bubblePosition) as Edge, to: bubblePosition },
            { from: EdgeVertical.middle, to: EdgeVertical.middle }
        );
    } else {
        bubble.alignTo(
            meter,
            { from: Edge.center, to: Edge.center },
            { from: getCounterEdge(bubblePosition) as EdgeVertical, to: bubblePosition }
        );
    }
    bubble.resizingConstraint = ResizingConstraint.width & ResizingConstraint.height;
    if (isHorizontal) {
        bubble.resizingConstraint = bubble.resizingConstraint & ResizingConstraint.top;
        meter.resizingConstraint = ResizingConstraint.left &
            ResizingConstraint.right &
            ResizingConstraint.height &
            ResizingConstraint.top
    } else {
        bubble.resizingConstraint = bubble.resizingConstraint & ResizingConstraint.left;
        meter.resizingConstraint = ResizingConstraint.top &
            ResizingConstraint.bottom &
            ResizingConstraint.width &
            ResizingConstraint.left
    }
    container.adjustToFit();
}

function calcBubblePosition(position: Edge | EdgeVertical): Edge | EdgeVertical {
    switch (position) {
        case Edge.center:
            return Edge.right;
        case EdgeVertical.middle:
            return EdgeVertical.top;
        // case Edge.left:
        // case Edge.right:
        // case EdgeVertical.top:
        // case EdgeVertical.bottom:
        default:
            return position;
    }
}

function getCounterEdge(position: Edge | EdgeVertical): Edge | EdgeVertical {
    switch (position) {
        case Edge.left:
            return Edge.right;
        case Edge.right:
            return Edge.left;
        case EdgeVertical.top:
            return EdgeVertical.bottom;
        case EdgeVertical.bottom:
            return EdgeVertical.top;
        default:
            return position;
    }
}
