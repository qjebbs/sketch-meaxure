import { GradientTypes, FillTypes, BorderPositions } from "../state/common";
import { context } from "../state/context";
import { find, toHex } from "./helper";
import { SMRect, SMPoint, SMColorStop, SMGradient } from "./interfaces-deprecated";
import { SMColor } from "./interfaces";

export function is(layer, theClass) {
    if (!layer) return false;
    let klass = layer.class();
    return klass === theClass;
}
export function addGroup() {
    return MSLayerGroup.new();
}
export function addShape() {
    return MSShapeGroup.shapeWithRect(NSMakeRect(0, 0, 100, 100));

}
export function addText() {
    let text = MSTextLayer.new();
    text.setStringValue("text");
    return text;
}
export function removeLayer(layer) {
    let container = layer.parentGroup();
    if (container) container.removeLayer(layer);
}
export function getRect(layer): SMRect {
    let rect = layer.absoluteRect();
    return {
        x: Math.round(rect.x()),
        y: Math.round(rect.y()),
        width: Math.round(rect.width()),
        height: Math.round(rect.height()),
        setX: function (x) {
            rect.setX(x);
            this.x = x;
            this.maxX = this.x + this.width;
        },
        setY: function (y) {
            rect.setY(y);
            this.y = y;
            this.maxY = this.y + this.height;
        },
        setWidth: function (width) {
            rect.setWidth(width);
            this.width = width;
            this.maxX = this.x + this.width;
        },
        setHeight: function (height) {
            rect.setHeight(height);
            this.height = height;
            this.maxY = this.y + this.height;
        }
    };
}
export function emojiToEntities(str) {
    let emojiRegExp = new RegExp("(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])", "g");
    return str.replace(
        emojiRegExp,
        function (match) {
            let u = "";
            for (let i = 0; i < match.length; i++) {
                if (!(i % 2)) {
                    u += "&#" + match.codePointAt(i)
                }
            }

            return u;
        });
}
export function toSlug(str) {
    return toJSString(str)
        .toLowerCase()
        .replace(/(<([^>]+)>)/ig, "")
        .replace(/[\/\+\|]/g, " ")
        .replace(new RegExp("[\\!@#$%^&\\*\\(\\)\\?=\\{\\}\\[\\]\\\\\\\,\\.\\:\\;\\']", "gi"), '')
        .replace(/\s+/g, '-');
}
export function toJSString(str) {
    return new String(str).toString();
}
export function toJSNumber(str) {
    return Number(toJSString(str));
}
export function pointToJSON(point): SMPoint {
    return {
        x: parseFloat(point.x),
        y: parseFloat(point.y)
    };
}
export function rectToJSON(rect, referenceRect) {
    if (referenceRect) {
        return {
            x: Math.round((rect.x() - referenceRect.x()) * 10) / 10,
            y: Math.round((rect.y() - referenceRect.y()) * 10) / 10,
            width: Math.round(rect.width() * 10) / 10,
            height: Math.round(rect.height() * 10) / 10
        };
    }

    return {
        x: Math.round(rect.x() * 10) / 10,
        y: Math.round(rect.y() * 10) / 10,
        width: Math.round(rect.width() * 10) / 10,
        height: Math.round(rect.height() * 10) / 10
    };
}
export function colorToJSON(color): SMColor {
    return {
        r: Math.round(color.red() * 255),
        g: Math.round(color.green() * 255),
        b: Math.round(color.blue() * 255),
        a: color.alpha(),
        "color-hex": color.immutableModelObject().stringValueWithAlpha(false) + " " + Math.round(color.alpha() * 100) + "%",
        "argb-hex": "#" + toHex(color.alpha() * 255) + color.immutableModelObject().stringValueWithAlpha(false).replace("#", ""),
        "css-rgba": "rgba(" + [
            Math.round(color.red() * 255),
            Math.round(color.green() * 255),
            Math.round(color.blue() * 255),
            (Math.round(color.alpha() * 100) / 100)
        ].join(",") + ")",
        "ui-color": "(" + [
            "r:" + (Math.round(color.red() * 100) / 100).toFixed(2),
            "g:" + (Math.round(color.green() * 100) / 100).toFixed(2),
            "b:" + (Math.round(color.blue() * 100) / 100).toFixed(2),
            "a:" + (Math.round(color.alpha() * 100) / 100).toFixed(2)
        ].join(" ") + ")"
    };
}
export function colorStopToJSON(colorStop): SMColorStop {
    return {
        color: colorToJSON(colorStop.color()),
        position: colorStop.position()
    };
}
export function gradientToJSON(gradient): SMGradient {
    let stopsData = [],
        stop, stopIter = gradient.stops().objectEnumerator();
    while (stop = stopIter.nextObject()) {
        stopsData.push(colorStopToJSON(stop));
    }

    return {
        type: GradientTypes[gradient.gradientType()],
        from: pointToJSON(gradient.from()),
        to: pointToJSON(gradient.to()),
        colorStops: stopsData
    };
}
export function shadowToJSON(shadow) {
    return {
        type: shadow instanceof MSStyleShadow ? "outer" : "inner",
        offsetX: shadow.offsetX(),
        offsetY: shadow.offsetY(),
        blurRadius: shadow.blurRadius(),
        spread: shadow.spread(),
        color: colorToJSON(shadow.color())
    };
}
export function getRadius(layer) {
    if (layer.layers && is(layer.layers().firstObject(), MSRectangleShape)) {
        return (layer.layers().firstObject().cornerRadiusString().split(';').map(Number).length == 1) ? layer.layers().firstObject().fixedRadius() : layer.layers().firstObject().cornerRadiusString().split(';').map(Number);
    } else if (is(layer, MSRectangleShape)) {
        return (layer.cornerRadiusString().split(';').map(Number).length == 1) ? layer.fixedRadius() : layer.cornerRadiusString().split(';').map(Number);
    } else {
        return 0;
    }
}
export function getBorders(style) {
    let bordersData = [],
        border, borderIter = style.borders().objectEnumerator();
    while (border = borderIter.nextObject()) {
        if (border.isEnabled()) {
            let fillType = FillTypes[border.fillType()],
                borderData = {
                    fillType: fillType,
                    position: BorderPositions[border.position()],
                    thickness: border.thickness(),
                    color: <SMColor>{},
                    gradient: <SMGradient>{},
                };

            switch (fillType) {
                case "color":
                    borderData.color = colorToJSON(border.color());
                    break;

                case "gradient":
                    borderData.gradient = gradientToJSON(border.gradient());
                    break;

                default:
                    continue;
            }

            bordersData.push(borderData);
        }
    }

    return bordersData;
}
export function getFills(style) {
    let fillsData = [],
        fill, fillIter = style.fills().objectEnumerator();
    while (fill = fillIter.nextObject()) {
        if (fill.isEnabled()) {
            let fillType = FillTypes[fill.fillType()],
                fillData = {
                    fillType: fillType,
                    color: <SMColor>{},
                    gradient: <SMGradient>{}
                };

            switch (fillType) {
                case "color":
                    fillData.color = colorToJSON(fill.color());
                    break;

                case "gradient":
                    fillData.gradient = gradientToJSON(fill.gradient());
                    break;

                default:
                    continue;
            }

            fillsData.push(fillData);
        }
    }

    return fillsData;
}
export function getShadows(style) {
    let shadowsData = [],
        shadow, shadowIter = style.shadows().objectEnumerator();
    while (shadow = shadowIter.nextObject()) {
        if (shadow.isEnabled()) {
            shadowsData.push(shadowToJSON(shadow));
        }
    }

    shadowIter = style.innerShadows().objectEnumerator();
    while (shadow = shadowIter.nextObject()) {
        if (shadow.isEnabled()) {
            shadowsData.push(shadowToJSON(shadow));
        }
    }

    return shadowsData;
}
export function getOpacity(style) {
    return style.contextSettings().opacity()
}
export function getStyleName(layer) {
    let styles = (is(layer, MSTextLayer)) ? context.sketchObject.document.documentData().layerTextStyles() : context.sketchObject.document.documentData().layerStyles(),
        layerStyle = layer.style(),
        sharedObjectID = layerStyle.objectID(),
        style;

    styles = styles.objectsSortedByName();

    if (styles.count() > 0) {
        style = find({
            key: "(objectID != NULL) && (objectID == %@)",
            match: sharedObjectID
        }, styles);
    }

    if (!style) return "";
    return toJSString(style.name());
}