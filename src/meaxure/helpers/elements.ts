// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from "../../sketch";
import { Edge, EdgeVertical } from "../../sketch/layer/alignment";
import { TextBehaviour } from "../../sketch/text";
import { ResizingConstraint } from "../../sketch/layer/resizingConstraint";

export function createRuler(
    size: number,
    options?: {
        name?: string,
        parent?: Group,
        background?: SharedStyle,
        isHorizontal?: boolean;
    }
): Group {
    if (!options || options.isHorizontal) {
        return createMeterHorizontal(size, options);
    }
    return createMeterVertical(size, options);
}
function createMeterHorizontal(
    size: number,
    options?: {
        name?: string,
        parent?: Group,
        background?: SharedStyle,
    }
): Group {
    if (size <= 0) return;
    options = Object.assign({}, options);
    let container = new sketch.Group({ name: options.name, parent: options.parent as Group });
    let start = new sketch.ShapePath({ name: 'start', parent: container });
    let body = new sketch.ShapePath({ name: 'body', parent: container });
    start.frame.width = 1;
    start.frame.height = 5;
    body.frame.width = size;
    body.frame.height = 1;

    if (options.background) {
        start.sharedStyle = options.background;
        start.style = options.background.style;
        body.sharedStyle = options.background;
        body.style = options.background.style;
    }
    let end = start.duplicate();
    start.alignTo(
        body,
        { from: Edge.left, to: Edge.left },
        { from: EdgeVertical.middle, to: EdgeVertical.middle }
    )
    end.alignTo(
        body,
        { from: Edge.right, to: Edge.right },
        { from: EdgeVertical.middle, to: EdgeVertical.middle }
    )
    start.resizingConstraint = ResizingConstraint.left &
        ResizingConstraint.width &
        ResizingConstraint.height
    end.resizingConstraint = ResizingConstraint.right &
        ResizingConstraint.width &
        ResizingConstraint.height
    body.resizingConstraint = ResizingConstraint.left &
        ResizingConstraint.right &
        ResizingConstraint.height
    container.adjustToFit();
    return container;
}
function createMeterVertical(
    size: number,
    options?: {
        name?: string,
        parent?: Group,
        background?: SharedStyle,
    }
): Group {
    if (size <= 0) return;
    options = Object.assign({}, options);
    let container = new sketch.Group({ name: options.name, parent: options.parent as Group });
    let start = new sketch.ShapePath({ name: 'start', parent: container });
    let body = new sketch.ShapePath({ name: 'body', parent: container });
    start.frame.width = 5;
    start.frame.height = 1;
    body.frame.width = 1;
    body.frame.height = size;

    if (options.background) {
        start.sharedStyle = options.background;
        start.style = options.background.style;
        body.sharedStyle = options.background;
        body.style = options.background.style;
    }
    let end = start.duplicate();
    start.alignTo(
        body,
        { from: Edge.center, to: Edge.center },
        { from: EdgeVertical.top, to: EdgeVertical.top }
    )
    end.alignTo(
        body,
        { from: Edge.center, to: Edge.center },
        { from: EdgeVertical.bottom, to: EdgeVertical.bottom }
    )
    start.resizingConstraint = ResizingConstraint.top &
        ResizingConstraint.width &
        ResizingConstraint.height
    end.resizingConstraint = ResizingConstraint.bottom &
        ResizingConstraint.width &
        ResizingConstraint.height
    body.resizingConstraint = ResizingConstraint.top &
        ResizingConstraint.bottom &
        ResizingConstraint.width
    container.adjustToFit();
    return container;
}
export function createLabel(
    content: string,
    options?: {
        name?: string,
        parent?: Group,
        foreground?: SharedStyle,
        background?: SharedStyle,
        padding?: number,
    }
): Group {
    content = content || 'Label';
    let container = new sketch.Group({ name: options.name, parent: options.parent as Group });
    let box = new sketch.ShapePath({ name: 'background', parent: container });
    let text = new sketch.Text({ name: 'text', text: content, parent: container });
    if (options.foreground) {
        text.sharedStyle = options.foreground;
        text.style = options.foreground.style;
    }
    if (options.background) {
        box.sharedStyle = options.background;
        box.style = options.background.style;
    }
    text.textBehaviour = TextBehaviour.fixedSize;
    text.resizingConstraint = ResizingConstraint.top &
        ResizingConstraint.bottom &
        ResizingConstraint.left &
        ResizingConstraint.right;
    // set radius
    box.points.forEach(p => p.cornerRadius = 2);

    // update frame parameters except postion
    box.frame.width = text.frame.width + (options.padding || 8);
    box.frame.height = text.frame.height + (options.padding || 8);

    text.alignTo(
        box,
        { from: Edge.center, to: Edge.center },
        { from: EdgeVertical.middle, to: EdgeVertical.middle },
    )
    container.adjustToFit();
    return container;
}
export function createBubble(
    content: string,
    options?: {
        name?: string,
        parent?: Group,
        foreground?: SharedStyle,
        background?: SharedStyle,
        padding?: number,
        bubblePosition?: Edge | EdgeVertical,
    }
): Group {

    let container = new sketch.Group({ name: options.name, parent: options.parent as Group });

    let label = createLabel(content, {
        name: 'label',
        parent: container,
        foreground: options.foreground,
        background: options.background,
        padding: options.padding,
    });
    label.resizingConstraint = ResizingConstraint.top &
        ResizingConstraint.bottom &
        ResizingConstraint.left &
        ResizingConstraint.right;
    let arrow = createArrowFor(label, {
        background: options.background,
        bubblePosition: options.bubblePosition,
    })
    container.adjustToFit();
    return container;
}

function createArrowFor(
    target: Group,
    options: {
        background: SharedStyle,
        bubblePosition: Edge | EdgeVertical,
    }): ShapePath {
    if (options.bubblePosition == Edge.center || options.bubblePosition == EdgeVertical.middle) {
        return undefined;
    }
    let arrow = new sketch.ShapePath({ name: 'arrow', parent: target.parent as Group });
    if (options.background) {
        arrow.sharedStyle = options.background;
        arrow.style = options.background.style;
    }
    arrow.frame.width = 6;
    arrow.frame.height = 6;
    arrow.transform.rotation = 45;

    let arrowConstraint: ResizingConstraint;
    let position = options.bubblePosition || Edge.right;

    switch (position) {
        case EdgeVertical.top:
            arrow.alignTo(
                target,
                { from: Edge.center, to: Edge.center },
                { from: EdgeVertical.middle, to: EdgeVertical.bottom },
            )
            arrowConstraint = ResizingConstraint.bottom;
            break;
        case Edge.right:
            arrow.alignTo(
                target,
                { from: Edge.center, to: Edge.left },
                { from: EdgeVertical.middle, to: EdgeVertical.middle },
            )
            arrowConstraint = ResizingConstraint.left;
            break;
        case EdgeVertical.bottom:
            arrow.alignTo(
                target,
                { from: Edge.center, to: Edge.center },
                { from: EdgeVertical.middle, to: EdgeVertical.top },
            )
            arrowConstraint = ResizingConstraint.top;
            break;
        case Edge.left:
            arrow.alignTo(
                target,
                { from: Edge.center, to: Edge.right },
                { from: EdgeVertical.middle, to: EdgeVertical.middle },
            )
            arrowConstraint = ResizingConstraint.right;
            break;
        default:
            break;
    }
    arrow.resizingConstraint = arrowConstraint &
        ResizingConstraint.width &
        ResizingConstraint.height;
    return arrow;
}