import { extend, find, mathHalf } from "../api/helper";
import { getRect, removeLayer, addGroup, addText, is, addShape } from "../api/api";
import { context } from "../state/context";
import { SMLayer } from "../api/SMLayer";

export function sharedLayerStyle(name, color, borderColor?) {
    let sharedStyles = context.documentData.layerStyles();
    let style = find({
        key: "(name != NULL) && (name == %@)",
        match: name
    }, sharedStyles);

    style = (!style || is(style, MSSharedStyle)) ? style : style[0];

    if (style == false) {
        style = MSStyle.alloc().init();

        let msColor = MSColor.colorWithRed_green_blue_alpha(color.r, color.g, color.b, color.a);
        let fill = style.addStylePartOfType(0);

        fill.color = msColor;

        if (borderColor) {
            let border = style.addStylePartOfType(1);
            borderColor = MSColor.colorWithRed_green_blue_alpha(borderColor.r, borderColor.g, borderColor.b, borderColor.a);

            border.color = borderColor;
            border.thickness = 1;
            border.position = 1;
        }

        const s = MSSharedStyle.alloc().initWithName_style(name, style);
        sharedStyles.addSharedObject(s);
    }

    style = find({
        key: "(name != NULL) && (name == %@)",
        match: name
    }, sharedStyles);
    return style;
}
export function sharedTextStyle(name, color, alignment?) {
    let sharedStyles = context.document.documentData().layerTextStyles(),
        style = find({
            key: "(name != NULL) && (name == %@)",
            match: name
        }, sharedStyles);

    style = (!style || is(style, MSSharedStyle)) ? style : style[0];

    if (style == false) {
        let nsColor = MSColor.colorWithRed_green_blue_alpha(color.r, color.g, color.b, color.a);
        let text = addText();
        alignment = alignment || 0; //[left, right, center, justify]

        text.changeTextColorTo(nsColor.NSColorWithColorSpace(nil));

        text.setFontSize(12);
        text.setFontPostscriptName("HelveticaNeue");
        text.setTextAlignment(alignment);

        style = text.style();

        const s = MSSharedStyle.alloc().initWithName_style(name, style);

        sharedStyles.addSharedObject(s);
        removeLayer(text);
    }

    style = find({
        key: "(name != NULL) && (name == %@)",
        match: name
    }, sharedStyles);
    return style;

}
export function setLabel(options) {
    options = extend(options, {
        text: "Label",
        container: context.current,
        target: context.current
    });
    let container = options.container,
        styles = options.styles,
        target = options.target,
        placement = options.placement,
        shapeTemp = addShape(),
        textTemp = addText();

    if (styles) {
        shapeTemp.setSharedStyle(styles.layer);
        textTemp.setSharedStyle(styles.text);
    } else {
        shapeTemp.style().addStylePartOfType(0);
    }

    let arrow = shapeTemp.duplicate(),
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
    let targetRect = getRect(target),
        arrowRect = getRect(arrow),
        boxRect = getRect(box),
        textRect = getRect(text);

    // rect function
    let x = targetRect.x + mathHalf(targetRect.width) - mathHalf(textRect.width),
        y = targetRect.y + mathHalf(targetRect.height) - mathHalf(textRect.height),
        arrowX = x - 3 + mathHalf(textRect.width + 6) - 3,
        arrowY = y - 3 + mathHalf(textRect.height + 6) - 3;

    if (!is(target, MSPage) && !is(target, MSArtboardGroup)) {
        switch (placement) {
            case "top":
                y = targetRect.y - textRect.height - 10;
                arrowY = y + textRect.height;
                break;
            case "right":
                x = targetRect.x + targetRect.width + 10;
                arrowX = x - 8;
                break;
            case "bottom":
                y = targetRect.y + targetRect.height + 10;
                arrowY = y - 8;
                break;
            case "left":
                x = targetRect.x - textRect.width - 10;
                arrowX = x + textRect.width;
                break;
        }
    }

    if (is(context.current, MSArtboardGroup)) {
        let artboardRect = getRect(context.current);

        if (x - 4 < artboardRect.x) {
            x = artboardRect.x + 4;
        } else if (x + textRect.width + 4 > targetRect.x + targetRect.width) {
            x = targetRect.x + targetRect.width - (textRect.width + 4);
        } else if (y - 4 < artboardRect.y) {
            y = artboardRect.y + 4;
        } else if (y + textRect.height + 4 > artboardRect.y + artboardRect.height) {
            y = artboardRect.y + artboardRect.height - (textRect.height + 4);
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
    options = extend(options, {
        container: context.current,
        target: context.current,
        type: "width",
        placement: "center",
    });
    let container = options.container,
        type = options.type,
        styles = options.styles,
        target = options.target,
        placement = options.placement,
        shapeTemp = addShape();

    if (styles) {
        shapeTemp.setSharedStyle(styles.layer);
    } else {
        shapeTemp.style().addStylePartOfType(0);
    }

    let start = shapeTemp.duplicate(),
        end = shapeTemp.duplicate(),
        line = shapeTemp.duplicate(),
        targetRect = getRect(target),
        startRect = getRect(start),
        endRect = getRect(end),
        lineRect = getRect(line);

    container.addLayers([start, end, line]);

    start.setName("ruler-start");
    end.setName("ruler-end");
    line.setName("ruler-line");
    let x: number, y: number;
    let startX: number, startY: number, endX: number, endY: number;
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
        let x = targetRect.x + mathHalf(targetRect.width) - 1,
            y = targetRect.y;

        if (!is(target, MSPage) && !is(target, MSArtboardGroup)) {
            switch (placement) {
                case "left":
                    x = targetRect.x - 4;
                    break;
                case "right":
                    x = targetRect.x + targetRect.width + 3;
                    break;
            }
        }

        let startX = x - 2,
            startY = y,
            endX = startX,
            endY = targetRect.y + targetRect.height - 1;
    } else {
        // set sizes
        lineRect.setWidth(targetRect.width);
        lineRect.setHeight(1);
        startRect.setWidth(1);
        startRect.setHeight(5);
        endRect.setWidth(1);
        endRect.setHeight(5);

        // get positions
        x = targetRect.x;
        y = targetRect.y + mathHalf(targetRect.height) - 1;

        if (!is(target, MSPage) && !is(target, MSArtboardGroup)) {
            switch (placement) {
                case "top":
                    y = targetRect.y - 4;
                    break;
                case "bottom":
                    y = targetRect.y + targetRect.height + 3;
                    break;
            }
        }

        startX = x;
        startY = y - 2;
        endX = targetRect.x + targetRect.width - 1;
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
    value = Math.round(value / context.configs.scale * 10) / 10;
    let units = context.configs.units.split("/"),
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
export function setStyle(layer: SMLayer, style) {
    layer.sketchObject.setSharedStyle(style);
}
export function getDistances(from: SMLayer, to?: SMLayer) {
    to = to || from.current;
    let rectFrom = from.rect,
        rectTo = to.rect;
    return {
        top: rectFrom.y - rectTo.y,
        right: rectTo.x + rectTo.width - (rectFrom.x + rectFrom.width),
        bottom: rectTo.y + rectTo.height - (rectFrom.y + rectFrom.height),
        left: rectFrom.x - rectTo.x
    }
}