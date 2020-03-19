import { localize } from "../state/language";
import { message, getDistance, convertUnit, extend, find, mathHalf } from "../api/helper";
import { propertiesPanel } from "../panels/propertiesPanel";
import { context } from "../state/context";
import { getRect, is, colorToJSON, getFills, getBorders, getRadius, getStyleName, removeLayer, addGroup, shadowToJSON } from "../api/api";
import { Color } from "../api/interfaces";
import { colorNames, colors } from "../state/common";
import { sharedLayerStyle, sharedTextStyle, setLabel } from "./base";

export async function markProperties() {
    let selection = /*this.*/ context.selection;
    if (selection.count() <= 0) {
        /*this.*/ message(localize("Select a layer to mark!"));
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
    let selection = /*this.*/context.selection;

    if (selection.count() <= 0) {
        /*this.*/message(localize("Select a layer to mark!"));
        return false;
    }

    let target = selection[0];

    if (/#properties-/.exec(target.parentGroup().name())) {
        /*this.*/resizeProperties(target.parentGroup());
    } else {
        for (let i = 0; i < selection.count(); i++) {
            let target = selection[i],
                targetRect = /*this.*/getRect(target),
                distance = /*this.*/getDistance(targetRect),
                placement = {};

            placement[distance.right] = "right";
            placement[distance.bottom] = "bottom";
            placement[distance.left] = "left";
            placement[distance.top] = "top";

            /*this.*/properties({
                target: target,
                placement: placement[Math.max(distance.top, distance.right, distance.bottom, distance.left)],
                properties: ["layer-name", "color", "border", "opacity", "radius", "shadow", "font-size", "font-face", "character", "line-height", "paragrapht"]
            });
        }
    }
}

function properties(options) {
    options = /*this.*/extend(options, {
        placement: "top",
        properties: ["layer-name", "color", "border", "opacity", "radius", "shadow", "font-size", "line-height", "font-face", "character", "paragraph"]
    });
    let properties = options.properties,
        placement = options.placement,
        styles = {
            layer: /*this.*/sharedLayerStyle("Sketch Measure / Property", /*this.*/colors.property.shape),
            text: /*this.*/sharedTextStyle("Sketch Measure / Property", /*this.*/colors.property.text)
        },
        target = options.target,
        targetStyle = target.style(),
        content = [];

    properties.forEach(function (property) {
        switch (property) {
            case "color":
                let fill, color: Color;
                if (/*self.*/is(target, MSTextLayer)) {
                    let color = /*self.*/colorToJSON(target.textColor()),
                        colorID = color["argb-hex"];
                    color = (/*self.*/colorNames && /*self.*/colorNames[colorID]) ? /*self.*/colorNames[colorID] : color[/*self.*/context.configs.format];
                    content.push("color: " + color);
                } else if (/*self.*/is(target, MSShapeGroup)) {
                    let fillsJSON = /*self.*/getFills(targetStyle);
                    if (fillsJSON.length <= 0) return false;
                    let fillJSON = fillsJSON.pop();
                    content.push("fill: " + /*self.*/fillTypeContent(fillJSON))
                }

                break;
            case "border":
                let bordersJSON = /*self.*/getBorders(targetStyle);
                if (bordersJSON.length <= 0) return false;
                let borderJSON = bordersJSON.pop();
                content.push("border: " + /*self.*/convertUnit(borderJSON.thickness) + " " + borderJSON.position + "\r\n * " + /*self.*/fillTypeContent(borderJSON));
                break;
            case "opacity":
                content.push("opacity: " + Math.round(targetStyle.contextSettings().opacity() * 100) + "%");
                break;
            case "radius":
                if ((/*self.*/is(target, MSShapeGroup) && /*self.*/is(target.layers().firstObject(), MSRectangleShape)) || /*self.*/is(target, MSRectangleShape)) {
                    content.push("radius: " + /*self.*/convertUnit(/*self.*/getRadius(target)));
                }
                break;
            case "shadow":
                if (targetStyle.firstEnabledShadow()) {
                    content.push("shadow: outer\r\n" + /*self.*/shadowContent(targetStyle.firstEnabledShadow()));
                }
                if (targetStyle.enabledInnerShadows().firstObject()) {
                    content.push("shadow: inner\r\n" + /*self.*/shadowContent(targetStyle.enabledInnerShadows().firstObject()));
                }
                break;
            case "font-size":
                if (!/*self.*/is(target, MSTextLayer)) return false;
                content.push("font-size: " + /*self.*/convertUnit(target.fontSize(), true));
                break;
            case "line-height":
                if (!/*self.*/is(target, MSTextLayer)) return false;
                let defaultLineHeight = target.font().defaultLineHeightForFont(),
                    lineHeight = target.lineHeight() || defaultLineHeight;
                content.push("line: " + /*self.*/convertUnit(lineHeight, true) + " (" + Math.round(lineHeight / target.fontSize() * 10) / 10 + ")");
                break;
            case "font-face":
                if (!/*self.*/is(target, MSTextLayer)) return false;
                content.push("font-face: " + target.fontPostscriptName());
                break;
            case "character":
                if (!/*self.*/is(target, MSTextLayer)) return false;
                content.push("character: " + /*self.*/convertUnit(target.characterSpacing(), true));
                break;
            case "paragraph":
                if (!/*self.*/is(target, MSTextLayer)) return false;
                content.push("paragraph: " + /*self.*/convertUnit(target.paragraphStyle().paragraphSpacing(), true));
                break;
            case "style-name":
                let styleName = /*self.*/getStyleName(target);
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
        container = /*this.*/find({
            key: "(name != NULL) && (name == %@)",
            match: name
        });

    if (container) /*this.*/removeLayer(container);
    container = /*this.*/addGroup();
    /*this.*/context.current.addLayers([container]);
    container.setName(name);

    let label = /*this.*/setLabel({
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
        text = /*this.*/find({
            key: "(class != NULL) && (class == %@)",
            match: MSTextLayer
        }, container),
        label = /*this.*/find({
            key: "(name != NULL) && (name == %@)",
            match: "label-box"
        }, container),
        textRect = /*this.*/getRect(text),
        labelRect = /*this.*/getRect(label),
        oldWidth = labelRect.width,
        oldHeight = labelRect.height,
        newWidth = textRect.width + 8,
        newHeight = textRect.height + 8,
        dWidth = newWidth - oldWidth,
        dHeight = newHeight - oldHeight,
        dHalfWidth = /*this.*/mathHalf(dWidth),
        dHalfHeight = /*this.*/mathHalf(dHeight),
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
    let shadowJSON = /*this.*/shadowToJSON(shadow),
        sc = [];
    // FIXME: unknown code
    // if (shadowJSON <= 0) return false;

    sc.push(" * x, y - " + /*this.*/convertUnit(shadowJSON.offsetX) + ", " + /*this.*/convertUnit(shadowJSON.offsetY));
    if (shadowJSON.blurRadius) sc.push(" * blur - " + /*this.*/convertUnit(shadowJSON.blurRadius));
    if (shadowJSON.spread) sc.push(" * spread - " + /*this.*/convertUnit(shadowJSON.spread));
    return sc.join("\r\n")
}

