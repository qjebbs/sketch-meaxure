import { context } from "../state/context";
import { lengthUnit } from "./base";
import { colors } from "../state/common";
import { localize } from "../state/language";
import { sketch } from "../sketch";
import { sharedLayerStyle, sharedTextStyle } from "../api/styles";
import { createLabel, createMeter } from "./common";
import { LayerAlignment, LayerVerticalAlignment } from "../sketch/alignment";

export function drawSizes(position: LayerAlignment | LayerVerticalAlignment) {
    if (context.selection.length <= 0) {
        sketch.UI.message(localize("Select any layer to mark!"));
        return false;
    }
    position = position || LayerVerticalAlignment.top;
    for (let layer of context.selection.layers) {
        drawSize(layer, position, {
            background: sharedLayerStyle(context.document, "Sketch MeaXure / Size", colors.size.shape),
            foreground: sharedTextStyle(context.document, "Sketch MeaXure / Size", colors.size.text)
        });
    }
}

export function drawSize(
    layer: Layer,
    position: LayerAlignment | LayerVerticalAlignment,
    options: {
        background: SharedStyle,
        foreground: SharedStyle,
        name?: string,
    }
): void {
    let sizeType = position === LayerVerticalAlignment.top ||
        position === LayerVerticalAlignment.middle ||
        position === LayerVerticalAlignment.bottom ?
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
    label.alignToByPostion(meter, LayerAlignment.center);
    container.adjustToFit();
}


