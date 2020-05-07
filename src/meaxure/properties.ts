// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { localize } from "./common/language";
import { convertUnit } from "./helpers/helper";
import { propertiesPanel } from "./panels/propertiesPanel";
import { context } from "./common/context";
import { sketch } from "../sketch";
import { parseColor, getFillsFromStyle, getBordersFromStyle, getLayerRadius, getShadowsFromStyle } from "./helpers/styles";
import { SMFillData, SMShadow, shadowType } from "./interfaces";
import { createBubble } from "./helpers/elements";
import { Edge, EdgeVertical } from "../sketch/layer/alignment";
import { applyTintToSMColor, applyTintToSMGradient } from "./export/tint";

export async function markProperties(position: Edge | EdgeVertical) {
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
            position: position,
            properties: context.configs.properties
        });
    }
}

export function markPropertiesAll() {
    let selection = context.selection.layers;

    if (selection.length <= 0) {
        sketch.UI.message(localize("Select a layer to mark!"));
        return false;
    }

    for (let target of selection) {
        properties({
            target: target,
            position: Edge.right,
            properties: ["layer-name", "color", "border", "opacity", "radius", "shadow", "font-size", "font-face", "character", "line-height", "paragraph", "style-name"]
        });
    }
}

function properties(options: { target: Layer, position: Edge | EdgeVertical, properties?: string[], content?: string }) {
    options = Object.assign({
        properties: ["layer-name", "color", "border", "opacity", "radius", "shadow", "font-size", "line-height", "font-face", "character", "paragraph", "style-name"]
    }, options);
    let target = options.target;

    let name = "#meaxure-properties-" + target.id;

    let artboard = target.getParentArtboard();
    let root = artboard || target.getParentPage();
    if (!root) return;
    sketch.find<Group>(
        `Group, [name="${name}"]`,
        root
    ).forEach(g => g.remove());

    let bubble = createBubble(
        options.content || getProperties(target, options.properties),
        {
            name: name,
            parent: root,
            foreground: context.meaxureStyles.property.foreground,
            background: context.meaxureStyles.property.background,
            bubblePosition: options.position,
        }
    )
    bubble.alignToByPostion(target, options.position)
}

function findTint(layer: Layer): Fill {
    let tint: Fill;
    let parent = layer.parent as Group;
    while (parent && parent.type !== sketch.Types.Artboard && parent.type !== sketch.Types.Page) {
        if (parent.style && parent.style.fills && parent.style.fills.length) {
            let fills = parent.style.fills.filter(f => f.enabled);
            if (!fills.length) continue;
            tint = fills[0];
        }
        parent = parent.parent as Group;
    }
    return tint;
}

function getProperties(target: Layer, properties: string[]): string {
    let targetStyle = target.style;
    let elements = properties.map((property) => {
        let results = [];
        switch (property) {
            case "color":
                // don't mark tint color
                if (
                    target.type == sketch.Types.Group ||
                    target.type == sketch.Types.SymbolInstance
                ) return undefined;
                let tint = findTint(target);
                if (target.type == sketch.Types.Text) {
                    let color = parseColor(targetStyle.textColor);
                    if (tint) color = applyTintToSMColor(color, tint.color);
                    results.push("color: " + color[context.configs.format]);
                }
                let fills = getFillsFromStyle(targetStyle).reverse();
                fills.forEach(fill => {
                    if (tint) {
                        if (fill.fillType == sketch.Style.FillType.Color) {
                            fill.color = applyTintToSMColor(fill.color, tint.color);
                        } else if (fill.fillType == sketch.Style.FillType.Gradient) {
                            fill.gradient = applyTintToSMGradient(fill.gradient, tint.color);
                        }
                    }
                    results.push("fill: " + fillTypeContent(fill));
                });
                return results.join('\n');
            case "border":
                let bordersJSON = getBordersFromStyle(targetStyle);
                if (bordersJSON.length <= 0) return undefined;
                let borderJSON = bordersJSON.pop();
                return "border: " + convertUnit(borderJSON.thickness) + " " + borderJSON.position + "\r\n * " + fillTypeContent(borderJSON);
            case "opacity":
                return "opacity: " + Math.round(targetStyle.opacity * 100) + "%";
            case "radius":
                if (target.type !== sketch.Types.ShapePath) return undefined;
                return "radius: " + convertUnit(getLayerRadius(target));
            case "shadow":
                let shadows = getShadowsFromStyle(targetStyle);
                let innerShadow = shadows.filter(s => s.type == shadowType.inner)[0];
                let outerShadow = shadows.filter(s => s.type == shadowType.outer)[0];
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
                // sharedStyle on group applies as tint, not looks exactly to it
                // don't mark style name to avoid confusion
                if (
                    target.type == sketch.Types.Group ||
                    target.type == sketch.Types.SymbolInstance
                ) return undefined;
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

function fillTypeContent(fillJSON: SMFillData) {
    if (fillJSON.fillType == "Color") {
        return fillJSON.color[context.configs.format];
    }

    if (fillJSON.fillType == "Gradient") {
        let fc = [];
        fc.push(fillJSON.gradient.type)
        fillJSON.gradient.colorStops.forEach(function (stop) {
            fc.push(" " + Math.round(stop.position * 100) + "%: " + stop.color[context.configs.format]);
        });
        return fc.join("\n");
    }
}
function shadowContent(shadow: SMShadow) {
    let sc = [];
    sc.push(" * x, y - " + convertUnit(shadow.offsetX) + ", " + convertUnit(shadow.offsetY));
    if (shadow.blurRadius) sc.push(" * blur - " + convertUnit(shadow.blurRadius));
    if (shadow.spread) sc.push(" * spread - " + convertUnit(shadow.spread));
    return sc.join("\r\n")
}
