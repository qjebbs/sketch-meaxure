import { extend, find, mathHalf } from "../api/helper";
import { getRect, removeLayer, addGroup, addText, is, addShape } from "../api/api";
import { context } from "../state/context";
import { Layer } from "../api/layer";

export function sharedLayerStyle(name, color, borderColor?) {
    var sharedStyles = /*this.*/context.documentData.layerStyles(),
        style = /*this.*/find({
            key: "(name != NULL) && (name == %@)",
            match: name
        }, sharedStyles);

    style = (!style || /*this.*/is(style, MSSharedStyle)) ? style : style[0];

    if (style == false) {
        style = MSStyle.alloc().init();

        var color = MSColor.colorWithRed_green_blue_alpha(color.r, color.g, color.b, color.a),
            fill = style.addStylePartOfType(0);

        fill.color = color;

        if (borderColor) {
            var border = style.addStylePartOfType(1),
                borderColor = MSColor.colorWithRed_green_blue_alpha(borderColor.r, borderColor.g, borderColor.b, borderColor.a);

            border.color = borderColor;
            border.thickness = 1;
            border.position = 1;
        }

        const s = MSSharedStyle.alloc().initWithName_style(name, style);
        sharedStyles.addSharedObject(s);
    }

    var style = /*this.*/find({
        key: "(name != NULL) && (name == %@)",
        match: name
    }, sharedStyles);
    return style;
}
export function sharedTextStyle(name, color, alignment?) {
    var sharedStyles = /*this.*/context.document.documentData().layerTextStyles(),
        style = /*this.*/find({
            key: "(name != NULL) && (name == %@)",
            match: name
        }, sharedStyles);

    style = (!style || /*this.*/is(style, MSSharedStyle)) ? style : style[0];

    if (style == false) {
        var color = MSColor.colorWithRed_green_blue_alpha(color.r, color.g, color.b, color.a),
            alignment = alignment || 0, //[left, right, center, justify]
            text = /*this.*/addText();

        text.changeTextColorTo(color.NSColorWithColorSpace(nil));

        text.setFontSize(12);
        text.setFontPostscriptName("HelveticaNeue");
        text.setTextAlignment(alignment);

        style = text.style();

        const s = MSSharedStyle.alloc().initWithName_style(name, style);

        sharedStyles.addSharedObject(s);
        /*this.*/removeLayer(text);
    }

    var style = /*this.*/find({
        key: "(name != NULL) && (name == %@)",
        match: name
    }, sharedStyles);
    return style;

}
export function setLabel(options) {
    var options = /*this.*/extend(options, {
        text: "Label",
        container: /*this.*/context.current,
        target: /*this.*/context.current
    }),
        container = options.container,
        styles = options.styles,
        target = options.target,
        placement = options.placement,
        shapeTemp = /*this.*/addShape(),
        textTemp = /*this.*/addText();

    if (styles) {
        shapeTemp.setSharedStyle(styles.layer);
        textTemp.setSharedStyle(styles.text);
    } else {
        shapeTemp.style().addStylePartOfType(0);
    }

    var arrow = shapeTemp.duplicate(),
        box = shapeTemp.duplicate(),
        text = textTemp.duplicate();

    container.addLayers([arrow, box, text]);

    // set radius
    box.layers().firstObject().setCornerRadiusFromComponents("2")

    // set name
    arrow.setName("label-arrow");
    box.setName("label-box");
    text.setName("label-text");

    // set text
    text.setStringValue(options.text);
    text.setTextBehaviour(1);
    text.setTextBehaviour(0);

    text.setTextBehaviour(1); // fixed for v40
    text.setTextBehaviour(0); // fixed for v40

    // get rect
    var targetRect = /*this.*/getRect(target),
        arrowRect = /*this.*/getRect(arrow),
        boxRect = /*this.*/getRect(box),
        textRect = /*this.*/getRect(text);

    // rect function
    var x = targetRect.x + /*this.*/mathHalf(targetRect.width) - /*this.*/mathHalf(textRect.width),
        y = targetRect.y + /*this.*/mathHalf(targetRect.height) - /*this.*/mathHalf(textRect.height),
        arrowX = x - 3 + /*this.*/mathHalf(textRect.width + 6) - 3,
        arrowY = y - 3 + /*this.*/mathHalf(textRect.height + 6) - 3;

    if (!/*this.*/is(target, MSPage) && !/*this.*/is(target, MSArtboardGroup)) {
        switch (placement) {
            case "top":
                y = targetRect.y - textRect.height - 10;
                arrowY = y + textRect.height;
                break;
            case "right":
                x = targetRect.maxX + 10;
                arrowX = x - 8;
                break;
            case "bottom":
                y = targetRect.maxY + 10;
                arrowY = y - 8;
                break;
            case "left":
                x = targetRect.x - textRect.width - 10;
                arrowX = x + textRect.width;
                break;
        }
    }

    if (/*this.*/is(/*this.*/context.current, MSArtboardGroup)) {
        var artboardRect = /*this.*/getRect(/*this.*/context.current);

        if (x - 4 < artboardRect.x) {
            x = artboardRect.x + 4;
        } else if (x + textRect.width + 4 > artboardRect.maxX) {
            x = artboardRect.maxX - (textRect.width + 4);
        } else if (y - 4 < artboardRect.y) {
            y = artboardRect.y + 4;
        } else if (y + textRect.height + 4 > artboardRect.maxY) {
            y = artboardRect.maxY - (textRect.height + 4);
        }
    }

    textRect.setX(x);
    textRect.setY(y);

    boxRect.setX(x - 4);
    boxRect.setY(y - 4);
    boxRect.setWidth(textRect.width + 8);
    boxRect.setHeight(textRect.height + 8);

    arrowRect.setWidth(6);
    arrowRect.setHeight(6);
    arrowRect.setX(arrowX);
    arrowRect.setY(arrowY);
    arrow.setRotation(45);

    return {
        element: box,
        rect: boxRect
    };
}
function setRuler(options) {
    var options = /*this.*/extend(options, {
        container: /*this.*/context.current,
        target: /*this.*/context.current,
        type: "width",
        placement: "center",
    }),
        container = options.container,
        type = options.type,
        styles = options.styles,
        target = options.target,
        placement = options.placement,
        shapeTemp = /*this.*/addShape();

    if (styles) {
        shapeTemp.setSharedStyle(styles.layer);
    } else {
        shapeTemp.style().addStylePartOfType(0);
    }

    var start = shapeTemp.duplicate(),
        end = shapeTemp.duplicate(),
        line = shapeTemp.duplicate(),
        targetRect = /*this.*/getRect(target),
        startRect = /*this.*/getRect(start),
        endRect = /*this.*/getRect(end),
        lineRect = /*this.*/getRect(line);

    container.addLayers([start, end, line]);

    start.setName("ruler-start");
    end.setName("ruler-end");
    line.setName("ruler-line");

    // height
    if (type == "height") {
        // set sizes
        lineRect.setWidth(1);
        lineRect.setHeight(targetRect.height);
        startRect.setWidth(5);
        startRect.setHeight(1);
        endRect.setWidth(5);
        endRect.setHeight(1);

        // get positions
        var x = targetRect.x + /*this.*/mathHalf(targetRect.width) - 1,
            y = targetRect.y;

        if (!/*this.*/is(target, MSPage) && !/*this.*/is(target, MSArtboardGroup)) {
            switch (placement) {
                case "left":
                    x = targetRect.x - 4;
                    break;
                case "right":
                    x = targetRect.maxX + 3;
                    break;
            }
        }

        var startX = x - 2,
            startY = y,
            endX = startX,
            endY = targetRect.maxY - 1;
    } else {
        // set sizes
        lineRect.setWidth(targetRect.width);
        lineRect.setHeight(1);
        startRect.setWidth(1);
        startRect.setHeight(5);
        endRect.setWidth(1);
        endRect.setHeight(5);

        // get positions
        var x = targetRect.x,
            y = targetRect.y + /*this.*/mathHalf(targetRect.height) - 1;

        if (!/*this.*/is(target, MSPage) && !/*this.*/is(target, MSArtboardGroup)) {
            switch (placement) {
                case "top":
                    y = targetRect.y - 4;
                    break;
                case "bottom":
                    y = targetRect.maxY + 3;
                    break;
            }
        }

        var startX = x,
            startY = y - 2,
            endX = targetRect.maxX - 1,
            endY = startY;
    }

    // set positions
    lineRect.setX(x);
    lineRect.setY(y);
    startRect.setX(startX);
    startRect.setY(startY);
    endRect.setX(endX);
    endRect.setY(endY);

    return {
        element: line,
        rect: lineRect
    };
}

export function lengthUnit(value: number, t?, flag?: boolean) {
    if (t && !flag) return Math.round(value / t * 1e3) / 10 + "%";
    var value = Math.round(value / context.configs.scale * 10) / 10,
        units = context.configs.units.split("/"),
        unit = units[0];
    if (flag && units.length > 1) unit = units[1];
    return "" + value + unit;
}
export function Rectangle(x: number, y: number, width: number, height: number) {
    return {
        x: x,
        y: y,
        width: width,
        height: height
    }
}
export function setStyle(layer: Layer, style) {
    layer.sketchObject.setSharedStyle(style);
}
export function getDistances(from: Layer, to?: Layer) {
    var to = to || from.current,
        rectFrom = from.rect,
        rectTo = to.rect;
    return {
        top: rectFrom.y - rectTo.y,
        right: rectTo.x + rectTo.width - (rectFrom.x + rectFrom.width),
        bottom: rectTo.y + rectTo.height - (rectFrom.y + rectFrom.height),
        left: rectFrom.x - rectTo.x
    }
}