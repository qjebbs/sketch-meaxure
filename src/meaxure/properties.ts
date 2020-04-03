import { localize } from "../state/language";
import { convertUnit } from "../api/helper";
import { propertiesPanel } from "../panels/propertiesPanel";
import { context } from "../state/context";
import { colors } from "../state/common";
import { sketch } from "../sketch";
import { parseColor, getFillsFromStyle, getBordersFromStyle, getLayerRadius, getShadowsFromStyle, sharedTextStyle, sharedLayerStyle } from "../api/styles";
import { FillData, SMShadow } from "../api/interfaces";

export async function markProperties() {
    let selection = context.selection;
    if (selection.length <= 0) {
        sketch.UI.message(localize("Select a layer to mark!"));
        return false;
    }
    if (!(await propertiesPanel()))
        return false;
    for (let target of selection.layers) {
        properties({
            target: target,
            placement: context.runningConfig.placement,
            properties: context.configs.properties
        });
    }
}

export function liteProperties() {
    let selection = context.selection.layers;

    if (selection.length <= 0) {
        sketch.UI.message(localize("Select a layer to mark!"));
        return false;
    }

    for (let target of selection) {
        properties({
            target: target,
            placement: "right",
            properties: ["layer-name", "color", "border", "opacity", "radius", "shadow", "font-size", "font-face", "character", "line-height", "paragraph", "style-name"]
        });
    }
}

function properties(options: { target: Layer, placement: string, properties?: string[], content?: string }) {
    options = Object.assign({
        placement: "top",
        properties: ["layer-name", "color", "border", "opacity", "radius", "shadow", "font-size", "line-height", "font-face", "character", "paragraph", "style-name"]
    }, options);
    let placement = options.placement;
    let target = options.target;

    let name = "#properties-" + target.id;
    let root = context.current;
    sketch.find<Group>(
        `Group, [name="${name}"]`,
        root
    ).forEach(g => g.remove());

    let container = new sketch.Group({ name: name, parent: root });
    setLabel({
        container: container,
        target: target,
        textStyle: sharedTextStyle(context.document, "Sketch MeaXure / Property", colors.property.text),
        layerStyle: sharedLayerStyle(context.document, "Sketch MeaXure / Property", colors.property.shape),
        text: options.content || getProperties(target, options.properties),
        placement: placement
    });
    // container.fixGeometryWithOptions(0);
}

function getProperties(target: Layer, properties: string[]): string {
    let targetStyle = target.style;
    let elements = properties.map((property) => {
        switch (property) {
            case "color":
                if (target.type == sketch.Types.Text) {
                    let color = parseColor(targetStyle.textColor);
                    return "color: " + color[context.configs.format];
                } else {
                    let fillsJSON = getFillsFromStyle(targetStyle);
                    if (fillsJSON.length <= 0) return undefined;
                    let fillJSON = fillsJSON.pop();
                    return "fill: " + fillTypeContent(fillJSON);
                }
            case "border":
                let bordersJSON = getBordersFromStyle(targetStyle);
                if (bordersJSON.length <= 0) return undefined;
                let borderJSON = bordersJSON.pop();
                return "border: " + convertUnit(borderJSON.thickness) + " " + borderJSON.position + "\r\n * " + fillTypeContent(borderJSON);
            case "opacity":
                return "opacity: " + Math.round(targetStyle.opacity * 100) + "%";
            case "radius":
                if (
                    target.type == sketch.Types.ShapePath ||
                    (target.type == sketch.Types.Group && target.layers[0].type == sketch.Types.ShapePath)
                ) {
                    return "radius: " + convertUnit(getLayerRadius(target));
                }
            case "shadow":
                let results = [];
                let shadows = getShadowsFromStyle(targetStyle);
                let innerShadow = shadows.filter(s => s.type == 'inner')[0];
                let outerShadow = shadows.filter(s => s.type == 'outer')[0];
                if (outerShadow) {
                    results.push("shadow: outer\r\n" + shadowContent(outerShadow));
                }
                if (innerShadow) {
                    results.push("shadow: inner\r\n" + shadowContent(innerShadow));
                }
                return results.join('\n');
            case "font-size":
                if (target.type != sketch.Types.Text) return undefined;
                return "font-size: " + convertUnit(targetStyle.fontSize, true);
            case "line-height":
                if (target.type != sketch.Types.Text) return undefined;
                let lineHeight = targetStyle.lineHeight;
                if (!lineHeight) return undefined;
                return "line: " + convertUnit(lineHeight, true) + " (" + Math.round(lineHeight / targetStyle.fontSize * 10) / 10 + ")";
            case "font-face":
                if (target.type != sketch.Types.Text) return undefined;
                return "font-face: " + targetStyle.fontFamily;
            case "character":
                if (target.type != sketch.Types.Text) return undefined;
                return "character: " + convertUnit(targetStyle.kerning, true);
            case "paragraph":
                if (target.type != sketch.Types.Text) return undefined;
                return "paragraph: " + convertUnit(targetStyle.paragraphSpacing, true);
            case "style-name":
                let sharedStyle = (target as Group).sharedStyle;
                if (sharedStyle) return "style-name: " + sharedStyle.name;
                break;
            case "layer-name":
                return "layer-name: " + target.name;
            default:
                break;
        }
    });
    return elements.filter(e => !!e).join('\n');
}

function setLabel(options: { target: Layer, text: string, textStyle?: SharedStyle, layerStyle?: SharedStyle, placement?: string, container?: Group, }) {
    options = Object.assign({
        text: "Label",
        container: context.current,
    }, options);
    if (!options.target) return;
    let container = options.container;
    let target = options.target;
    let placement = options.placement || 'right';

    let arrow = new sketch.ShapePath({ name: 'label-arrow', parent: container });
    let box = new sketch.ShapePath({ name: 'label-box', parent: container });
    let text = new sketch.Text({ name: 'label-text', text: options.text, parent: container });
    arrow.sharedStyle = options.layerStyle;
    box.sharedStyle = options.layerStyle;
    text.sharedStyle = options.textStyle;
    arrow.style = options.layerStyle.style;
    box.style = options.layerStyle.style;
    text.style = options.textStyle.style;
    // set radius
    box.points.forEach(p => p.cornerRadius = 2);

    // update frame parameters except postion
    let artboard = target.getParentArtboard();
    let textRect = text.frame.changeBasis({ from: text, to: box });
    arrow.frame.width = 6;
    arrow.frame.height = 6;
    box.frame.width = textRect.width + 8;
    box.frame.height = textRect.height + 8;
    arrow.transform.rotation = 45;

    let targetRect = target.frame.changeBasis({ from: target.parent, to: artboard });
    let boxRect = box.frame.changeBasis({ from: box.parent, to: artboard });
    let arrowRect = arrow.frame.changeBasis({ from: arrow.parent, to: artboard });

    let x: number;
    let y: number;
    let arrOffsetX: number;
    let arrOffsetY: number;
    let halfArrow = Math.floor(arrowRect.height / 2);
    switch (placement) {
        case "top":
            // move box to top, with margin 8
            x = targetRect.x + Math.floor(targetRect.width / 2) - Math.floor(boxRect.width / 2);
            y = targetRect.y - boxRect.height - 8;
            arrOffsetX = Math.floor(boxRect.width / 2) - Math.floor(arrowRect.width / 2);
            arrOffsetY = boxRect.height - halfArrow;
            break;
        case "right":
            // move box to right, with margin 8
            x = targetRect.x + targetRect.width + 8;
            y = targetRect.y + Math.floor(targetRect.height / 2) - Math.floor(boxRect.height / 2);
            arrOffsetX = - halfArrow;
            arrOffsetY = Math.floor(boxRect.height / 2) - Math.floor(arrowRect.height / 2);
            break;
        case "bottom":
            // move box to bottom, with margin 8
            x = targetRect.x + Math.floor(targetRect.width / 2) - Math.floor(boxRect.width / 2);
            y = targetRect.y + targetRect.height + 8;
            arrOffsetX = Math.floor(boxRect.width / 2) - Math.floor(arrowRect.width / 2);
            arrOffsetY = -halfArrow;
            break;
        case "left":
            // move box to left, with margin 8
            x = targetRect.x - boxRect.width - 8;
            y = targetRect.y + Math.floor(targetRect.height / 2) - Math.floor(boxRect.height / 2);
            arrOffsetX = boxRect.width - halfArrow;
            arrOffsetY = Math.floor(boxRect.height / 2) - Math.floor(arrowRect.height / 2);
            break;
    }
    // move box to position
    box.frame.x = x;
    box.frame.y = y;
    // move text to position
    text.frame.x = box.frame.x + 4;
    text.frame.y = box.frame.y + 4;
    // move arrow to position
    arrow.frame.x = box.frame.x + arrOffsetX;
    arrow.frame.y = box.frame.y + arrOffsetY;
    container.adjustToFit();

    return {
        element: box,
        rect: boxRect
    };
}

function fillTypeContent(fillJSON: FillData) {
    if (fillJSON.fillType == "Color") {
        return fillJSON.color[context.configs.format];
    }

    if (fillJSON.fillType == "Gradient") {
        let fc = [];
        fc.push(fillJSON.gradient.gradientType)
        fillJSON.gradient.stops.forEach(function (stop) {
            fc.push(" * " + stop.color);
        });
        return fc.join("\r\n");
    }
}
function shadowContent(shadow: SMShadow) {
    let sc = [];
    sc.push(" * x, y - " + convertUnit(shadow.offsetX) + ", " + convertUnit(shadow.offsetY));
    if (shadow.blurRadius) sc.push(" * blur - " + convertUnit(shadow.blurRadius));
    if (shadow.spread) sc.push(" * spread - " + convertUnit(shadow.spread));
    return sc.join("\r\n")
}
