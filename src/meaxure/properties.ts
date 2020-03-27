import { localize } from "../state/language";
import { getDistance, convertUnit, extend, find, mathHalf } from "../api/helper";
import { propertiesPanel } from "../panels/propertiesPanel";
import { context } from "../state/context";
import { getRect, is, colorToJSON, getFills, getBorders, getRadius, getStyleName, removeLayer, addGroup, shadowToJSON } from "../api/api";
import { SMColor } from "../api/interfaces";
import { colorNames, colors } from "../state/common";
import { sharedLayerStyle, sharedTextStyle, setLabel } from "./base";
import { sketch } from "../sketch";

export async function markProperties() {
    let selection = context.selection;
    if (selection.count() <= 0) {
        sketch.UI.message(localize("Select a layer to mark!"));
        return false;
    }
    let target = selection[0];
    if (!(await propertiesPanel()))
        return false;
    for (let i = 0; i < selection.count(); i++) {
        let target = selection[i];
        properties({
            target: target,
            placement: context.runningConfig.placement,
            properties: context.configs.properties
        });
    }
}

export function liteProperties() {
    let selection = context.selection;

    if (selection.count() <= 0) {
        sketch.UI.message(localize("Select a layer to mark!"));
        return false;
    }

    let target = selection[0];

    if (/#properties-/.exec(target.parentGroup().name())) {
        resizeProperties(target.parentGroup());
    } else {
        for (let i = 0; i < selection.count(); i++) {
            let target = selection[i],
                targetRect = getRect(target),
                distance = getDistance(targetRect),
                placement = {};

            placement[distance.right] = "right";
            placement[distance.bottom] = "bottom";
            placement[distance.left] = "left";
            placement[distance.top] = "top";

            properties({
                target: target,
                placement: placement[Math.max(distance.top, distance.right, distance.bottom, distance.left)],
                properties: ["layer-name", "color", "border", "opacity", "radius", "shadow", "font-size", "font-face", "character", "line-height", "paragrapht"]
            });
        }
    }
}

function properties(options) {
    options = extend(options, {
        placement: "top",
        properties: ["layer-name", "color", "border", "opacity", "radius", "shadow", "font-size", "line-height", "font-face", "character", "paragraph"]
    });
    let properties = options.properties,
        placement = options.placement,
        styles = {
            layer: sharedLayerStyle("Sketch Measure / Property", colors.property.shape),
            text: sharedTextStyle("Sketch Measure / Property", colors.property.text)
        },
        target = options.target,
        targetStyle = target.style(),
        content = [];

    properties.forEach(function (property) {
        switch (property) {
            case "color":
                let fill, color: SMColor;
                if (is(target, MSTextLayer)) {
                    let color = colorToJSON(target.textColor()),
                        colorID = color["argb-hex"];
                    color = (colorNames && colorNames[colorID]) ? colorNames[colorID] : color[context.configs.format];
                    content.push("color: " + color);
                } else if (is(target, MSShapeGroup)) {
                    let fillsJSON = getFills(targetStyle);
                    if (fillsJSON.length <= 0) return false;
                    let fillJSON = fillsJSON.pop();
                    content.push("fill: " + fillTypeContent(fillJSON))
                }

                break;
            case "border":
                let bordersJSON = getBorders(targetStyle);
                if (bordersJSON.length <= 0) return false;
                let borderJSON = bordersJSON.pop();
                content.push("border: " + convertUnit(borderJSON.thickness) + " " + borderJSON.position + "\r\n * " + fillTypeContent(borderJSON));
                break;
            case "opacity":
                content.push("opacity: " + Math.round(targetStyle.contextSettings().opacity() * 100) + "%");
                break;
            case "radius":
                if ((is(target, MSShapeGroup) && is(target.layers().firstObject(), MSRectangleShape)) || is(target, MSRectangleShape)) {
                    content.push("radius: " + convertUnit(getRadius(target)));
                }
                break;
            case "shadow":
                if (targetStyle.firstEnabledShadow()) {
                    content.push("shadow: outer\r\n" + shadowContent(targetStyle.firstEnabledShadow()));
                }
                if (targetStyle.enabledInnerShadows().firstObject()) {
                    content.push("shadow: inner\r\n" + shadowContent(targetStyle.enabledInnerShadows().firstObject()));
                }
                break;
            case "font-size":
                if (!is(target, MSTextLayer)) return false;
                content.push("font-size: " + convertUnit(target.fontSize(), true));
                break;
            case "line-height":
                if (!is(target, MSTextLayer)) return false;
                let defaultLineHeight = target.font().defaultLineHeightForFont(),
                    lineHeight = target.lineHeight() || defaultLineHeight;
                content.push("line: " + convertUnit(lineHeight, true) + " (" + Math.round(lineHeight / target.fontSize() * 10) / 10 + ")");
                break;
            case "font-face":
                if (!is(target, MSTextLayer)) return false;
                content.push("font-face: " + target.fontPostscriptName());
                break;
            case "character":
                if (!is(target, MSTextLayer)) return false;
                content.push("character: " + convertUnit(target.characterSpacing(), true));
                break;
            case "paragraph":
                if (!is(target, MSTextLayer)) return false;
                content.push("paragraph: " + convertUnit(target.paragraphStyle().paragraphSpacing(), true));
                break;
            case "style-name":
                let styleName = getStyleName(target);
                if (styleName) {
                    content.push("style-name: " + styleName);
                }
                break;
            case "layer-name":
                content.push("layer-name: " + target.name());
                break;
            default:
                break;
        }
    });

    let objectID = target.objectID(),
        name = "#properties-" + objectID,
        container = find({
            key: "(name != NULL) && (name == %@)",
            match: name
        });

    if (container) removeLayer(container);
    container = addGroup();
    context.current.addLayers([container]);
    container.setName(name);

    let label = setLabel({
        container: container,
        target: target,
        styles: styles,
        text: content.join("\r\n"),
        placement: placement
    });
    context.runningConfig.placement = placement;
    container.fixGeometryWithOptions(0);
}

function resizeProperties(container) {
    let placement = context.runningConfig.placement,
        text = find({
            key: "(class != NULL) && (class == %@)",
            match: MSTextLayer
        }, container),
        label = find({
            key: "(name != NULL) && (name == %@)",
            match: "label-box"
        }, container),
        textRect = getRect(text),
        labelRect = getRect(label),
        oldWidth = labelRect.width,
        oldHeight = labelRect.height,
        newWidth = textRect.width + 8,
        newHeight = textRect.height + 8,
        dWidth = newWidth - oldWidth,
        dHeight = newHeight - oldHeight,
        dHalfWidth = mathHalf(dWidth),
        dHalfHeight = mathHalf(dHeight),
        lx = labelRect.x,
        ly = labelRect.y,
        lw = labelRect.width,
        lh = labelRect.height,
        tx = textRect.x,
        ty = textRect.y,
        tw = textRect.width,
        th = textRect.height;

    if (!dWidth && !dHeight) return false;

    switch (placement) {
        case "top":
            lx = lx - dHalfWidth;
            ly = ly - dHeight;
            lw = lw + dWidth;
            lh = lh + dHeight;
            tx = tx - dHalfWidth;
            ty = ty - dHeight;
            break;
        case "right":
            ly = ly - dHalfHeight;
            lw = lw + dWidth;
            lh = lh + dHeight;
            ty = ty - dHalfHeight;
            break;
        case "bottom":
            lx = lx - dHalfWidth;
            lw = lw + dWidth;
            lh = lh + dHeight;
            tx = tx - dHalfWidth;
            break;
        case "left":
            lx = lx - dWidth;
            ly = ly - dHalfHeight;
            lw = lw + dWidth;
            lh = lh + dHeight;
            tx = tx - dWidth;
            ty = ty - dHalfHeight;
            break;
    }

    labelRect.setX(lx);
    labelRect.setY(ly);
    labelRect.setWidth(lw);
    labelRect.setHeight(lh);

    textRect.setX(tx);
    textRect.setY(ty);

    text.setTextBehaviour(1);
    text.setTextBehaviour(0);

    container.fixGeometryWithOptions(0);
}

function fillTypeContent(fillJSON) {
    if (fillJSON.fillType == "color") {
        let colorID = fillJSON.color["argb-hex"];
        return (colorNames && colorNames[colorID]) ? colorNames[colorID] : fillJSON.color[context.configs.format];
    }

    if (fillJSON.fillType == "gradient") {
        let fc = [];
        fc.push(fillJSON.gradient.type)
        fillJSON.gradient.colorStops.forEach(function (gradient) {
            let colorID = gradient.color["argb-hex"],
                color = (colorNames && colorNames[colorID]) ? colorNames[colorID] : gradient.color[context.configs.format];
            fc.push(" * " + color);
        });
        return fc.join("\r\n");
    }
}

function shadowContent(shadow) {
    let shadowJSON = shadowToJSON(shadow),
        sc = [];
    // FIXME: unknown code
    // if (shadowJSON <= 0) return false;

    sc.push(" * x, y - " + convertUnit(shadowJSON.offsetX) + ", " + convertUnit(shadowJSON.offsetY));
    if (shadowJSON.blurRadius) sc.push(" * blur - " + convertUnit(shadowJSON.blurRadius));
    if (shadowJSON.spread) sc.push(" * spread - " + convertUnit(shadowJSON.spread));
    return sc.join("\r\n")
}

