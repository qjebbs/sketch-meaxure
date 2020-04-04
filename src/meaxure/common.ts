import { sketch } from "../sketch";

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
        { from: sketch.Text.Alignment.center, to: sketch.Text.Alignment.center },
        { from: sketch.Text.VerticalAlignment.center, to: sketch.Text.VerticalAlignment.center },
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
        bubblePosition?: Alignment | VerticalAlignment,
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
    let placement = options.bubblePosition || sketch.Text.Alignment.right;

    switch (placement) {
        case sketch.Text.VerticalAlignment.top:
            arrow.alignTo(
                label,
                { from: sketch.Text.Alignment.center, to: sketch.Text.Alignment.center },
                { from: sketch.Text.VerticalAlignment.center, to: sketch.Text.VerticalAlignment.bottom },
            )
            break;
        case sketch.Text.Alignment.right:
            arrow.alignTo(
                label,
                { from: sketch.Text.Alignment.center, to: sketch.Text.Alignment.left },
                { from: sketch.Text.VerticalAlignment.center, to: sketch.Text.VerticalAlignment.center },
            )
            break;
        case sketch.Text.VerticalAlignment.bottom:
            arrow.alignTo(
                label,
                { from: sketch.Text.Alignment.center, to: sketch.Text.Alignment.center },
                { from: sketch.Text.VerticalAlignment.center, to: sketch.Text.VerticalAlignment.top },
            )
            break;
        case sketch.Text.Alignment.left:
            arrow.alignTo(
                label,
                { from: sketch.Text.Alignment.center, to: sketch.Text.Alignment.right },
                { from: sketch.Text.VerticalAlignment.center, to: sketch.Text.VerticalAlignment.center },
            )
            break;
        default:
            break;
    }
    container.adjustToFit();
    return container;
}