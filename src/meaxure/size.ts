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
    meter.alignToByPostion(
        // expand the frame so that the meter offsets to target by 1px;
        new sketch.Rectangle(frame.x - 1, frame.y - 1, frame.width + 2, frame.height + 2),
        position
    );
    let bubbleOptions = {
        name: 'label',
        parent: container,
        foreground: options.foreground,
        background: options.background,
        bubblePosition: position,
    }
    let bubble = createBubble(text, bubbleOptions);
    alignBubbleToMeter(bubble, meter, bubbleOptions.bubblePosition);
    // in case the bubble in middle/center of meter, but the meter is too small
    if (bubbleOptions.bubblePosition == Edge.center) {
        if (bubble.frame.height + 10 > meter.frame.height) {
            bubbleOptions.bubblePosition = Edge.right;
            // console.log(`center bubble(${text}) too large, move to ${bubblePosition}`);
            bubble.remove();
            bubble = createBubble(text, bubbleOptions);
            alignBubbleToMeter(bubble, meter, bubbleOptions.bubblePosition);
        }
    } else if (bubbleOptions.bubblePosition == EdgeVertical.middle) {
        if (bubble.frame.width + 10 > meter.frame.width) {
            bubbleOptions.bubblePosition = EdgeVertical.top;
            // console.log(`middle bubble(${text}) too large, move to ${bubblePosition}`);
            bubble.remove();
            bubble = createBubble(text, bubbleOptions);
            alignBubbleToMeter(bubble, meter, bubbleOptions.bubblePosition);
        }
    }
    // in case the bubble is out side the artboard
    let newBubblePosition = getCounterPositionIfOutside(bubble, meter, bubbleOptions.bubblePosition);
    if (bubbleOptions.bubblePosition !== newBubblePosition) {
        bubbleOptions.bubblePosition = newBubblePosition;
        // console.log(`bubble(${text}) outside the artboard, move to ${bubblePosition}`);
        bubble.remove();
        bubble = createBubble(text, bubbleOptions);
        alignBubbleToMeter(bubble, meter, bubbleOptions.bubblePosition);
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

function alignBubbleToMeter(bubble: Group, meter: Group, position: Edge | EdgeVertical): void {
    if (position == Edge.left || position == Edge.center || position == Edge.right) {
        bubble.alignTo(
            meter,
            { from: getCounterEdge(position) as Edge, to: position },
            { from: EdgeVertical.middle, to: EdgeVertical.middle }
        );
    } else {
        bubble.alignTo(
            meter,
            { from: Edge.center, to: Edge.center },
            { from: getCounterEdge(position) as EdgeVertical, to: position }
        );
    }
}

function getCounterPositionIfOutside(bubble: Group, meter: Group, position: Edge | EdgeVertical): Edge | EdgeVertical {
    let artboard = bubble.getParentArtboard();
    if (!artboard) return position;
    let frameBubble = bubble.frame.changeBasis({ from: bubble.parent as Group, to: artboard });
    let frameArtboard = artboard.frame.changeBasis({ from: artboard.parent, to: artboard });
    let intersection = frameBubble.intersection(frameArtboard);
    if (intersection && intersection.isEuqal(frameBubble)) return position;

    let isHorizontal = position === EdgeVertical.top ||
        position === EdgeVertical.middle ||
        position === EdgeVertical.bottom;
    if (isHorizontal && (!intersection || intersection.height != frameBubble.height)) return getCounterEdge(position);
    if (!isHorizontal && (!intersection || intersection.width != frameBubble.width)) return getCounterEdge(position);
    return position;
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
