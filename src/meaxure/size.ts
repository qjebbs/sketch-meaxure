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
        drawSize(layer, position, {
            background: context.meaxureStyles.size.background,
            foreground: context.meaxureStyles.size.foreground
        });
    }
}

export function drawSize(
    layer: Layer,
    position: Edge | EdgeVertical,
    options: {
        background: SharedStyle,
        foreground: SharedStyle,
        name?: string,
    }
): void {
    let sizeType = position === EdgeVertical.top ||
        position === EdgeVertical.middle ||
        position === EdgeVertical.bottom ?
        "width" : "height";
    options.name = options.name || "#" + sizeType + "-" + position + "-" + layer.id;
    let artboard = layer.getParentArtboard();
    let root = artboard || layer.getParentPage();
    if (artboard) sketch.find<Group>(
        `Group, [name="${options.name}"]`,
        artboard
    ).forEach(g => g.remove());

    let size: number;
    let text: string;
    let frame = context.configs.byInfluence ? layer.frameInfluence : layer.frame;
    size = sizeType === 'width' ? frame.width : frame.height;
    text = lengthUnit(size);
    if (context.configs.byPercentage && root.type != sketch.Types.Page) {
        let containerFrame = context.configs.byInfluence ? root.frameInfluence : root.frame;
        let containerSize = sizeType === 'height' ? containerFrame.width : containerFrame.height;
        text = lengthUnit(size, containerSize)
    }
    let container = new sketch.Group({ name: options.name, parent: root });
    let meter = createMeter(size, {
        name: 'meter',
        parent: container,
        background: options.background,
        isHorizontal: sizeType == 'width',
    })
    let label = createLabel(text, {
        name: 'label',
        parent: container,
        foreground: options.foreground,
        background: options.background
    })
    meter.alignToByPostion(layer, position)
    label.alignToByPostion(meter, Edge.center);
    label.resizingConstraint = ResizingConstraint.width & ResizingConstraint.height;
    if (sizeType == 'width') {
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


