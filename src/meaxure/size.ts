import { context } from "./common/context";
import { localize } from "./common/language";
import { sketch } from "../sketch";
import { createLabel, createMeter } from "./helpers/elements";
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
    let name = "#" + sizeType + "-" + position + "-" + layer.id;
    let artboard = layer.getParentArtboard();
    let root = artboard || layer.getParentPage();
    if (artboard) sketch.find<Group>(
        `Group, [name="${name}"]`,
        artboard
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
    let label = createLabel(text, {
        name: 'label',
        parent: container,
        foreground: options.foreground,
        background: options.background
    })
    meter.alignToByPostion(frame, position)
    label.alignToByPostion(meter, Edge.center);
    label.resizingConstraint = ResizingConstraint.width & ResizingConstraint.height;
    if (isHorizontal) {
        meter.resizingConstraint = ResizingConstraint.left &
            ResizingConstraint.right &
            ResizingConstraint.height
    } else {
        meter.resizingConstraint = ResizingConstraint.top &
            ResizingConstraint.bottom &
            ResizingConstraint.width
    }
    container.adjustToFit();
}
