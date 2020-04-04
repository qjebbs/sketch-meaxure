import { sketch } from "../../sketch";
import { LayerAlignment, LayerVerticalAlignment } from "../../sketch/alignment";

export function createMeter(
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
    let container = new sketch.Group({ name: options.name, parent: options.parent });
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
        { from: LayerAlignment.left, to: LayerAlignment.left },
        { from: LayerVerticalAlignment.middle, to: LayerVerticalAlignment.middle }
    )
    end.alignTo(
        body,
        { from: LayerAlignment.right, to: LayerAlignment.right },
        { from: LayerVerticalAlignment.middle, to: LayerVerticalAlignment.middle }
    )
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
    let container = new sketch.Group({ name: options.name, parent: options.parent });
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
        { from: LayerAlignment.center, to: LayerAlignment.center },
        { from: LayerVerticalAlignment.top, to: LayerVerticalAlignment.top }
    )
    end.alignTo(
        body,
        { from: LayerAlignment.center, to: LayerAlignment.center },
        { from: LayerVerticalAlignment.bottom, to: LayerVerticalAlignment.bottom }
    )
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
    let container = new sketch.Group({ name: options.name, parent: options.parent });
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
    // set radius
    box.points.forEach(p => p.cornerRadius = 2);

    // update frame parameters except postion
    box.frame.width = text.frame.width + (options.padding || 8);
    box.frame.height = text.frame.height + (options.padding || 8);

    text.alignTo(
        box,
        { from: LayerAlignment.center, to: LayerAlignment.center },
        { from: LayerVerticalAlignment.middle, to: LayerVerticalAlignment.middle },
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
        bubblePosition?: LayerAlignment | LayerVerticalAlignment,
    }
): Group {

    let container = new sketch.Group({ name: options.name, parent: options.parent });

    let arrow = new sketch.ShapePath({ name: 'arrow', parent: container });
    if (options.background) {
        arrow.sharedStyle = options.background;
        arrow.style = options.background.style;
    }
    arrow.frame.width = 6;
    arrow.frame.height = 6;
    arrow.transform.rotation = 45;

    let label = createLabel(content, {
        name: 'label',
        parent: container,
        foreground: options.foreground,
        background: options.background,
        padding: options.padding,
    });
    let placement = options.bubblePosition || LayerAlignment.right;

    switch (placement) {
        case LayerVerticalAlignment.top:
            arrow.alignTo(
                label,
                { from: LayerAlignment.center, to: LayerAlignment.center },
                { from: LayerVerticalAlignment.middle, to: LayerVerticalAlignment.bottom },
            )
            break;
        case LayerAlignment.right:
            arrow.alignTo(
                label,
                { from: LayerAlignment.center, to: LayerAlignment.left },
                { from: LayerVerticalAlignment.middle, to: LayerVerticalAlignment.middle },
            )
            break;
        case LayerVerticalAlignment.bottom:
            arrow.alignTo(
                label,
                { from: LayerAlignment.center, to: LayerAlignment.center },
                { from: LayerVerticalAlignment.middle, to: LayerVerticalAlignment.top },
            )
            break;
        case LayerAlignment.left:
            arrow.alignTo(
                label,
                { from: LayerAlignment.center, to: LayerAlignment.right },
                { from: LayerVerticalAlignment.middle, to: LayerVerticalAlignment.middle },
            )
            break;
        default:
            break;
    }
    container.adjustToFit();
    return container;
}