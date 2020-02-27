import { extend, find, convertUnit, getDistance, mathHalf } from "../api/helper";
import { getRect, removeLayer, addGroup, addText, is, addShape } from "../api/api";
import { context } from "../state/context";

export function sizes(options) {
    var options = /*this.*/extend(options, {}),
        name = options.name,
        type = options.type,
        placement = options.placement,
        byPercentage = options.byPercentage,
        styles = options.styles,
        target = options.target,
        targetRect = /*this.*/getRect(target),
        container = /*this.*/find({
            key: "(name != NULL) && (name == %@)",
            match: name
        });

    if (container) /*this.*/removeLayer(container);
    container = /*this.*/addGroup();
    /*this.*/context.current.addLayers([container]);
    container.setName(name);

    var length = (type == "height") ? targetRect.height : targetRect.width,
        percentageType = (byPercentage && type == "width") ? "width" :
            (byPercentage && type == "height") ? "height" :
                undefined,
        text = /*this.*/convertUnit(length, false, percentageType),
        temp = /*this.*/addText();

    temp.setStringValue(text);
    temp.setTextBehaviour(1);
    temp.setTextBehaviour(0);
    temp.setSharedStyle(styles.text);

    var tempRect = /*this.*/getRect(temp),
        ruler = /*this.*/setRuler({
            type: type,
            placement: placement,
            styles: styles,
            target: target,
            container: container
        }),
        distance = /*this.*/getDistance(ruler.rect),
        markPlacement = (type == "height") ? (
            (ruler.rect.height > (tempRect.height + 28)) ? "center" :
                (placement == "right") ? "right" :
                    (placement == "left") ? "left" :
                        (distance.right >= distance.left) ? "right" :
                            "left"
        ) :
            (
                (ruler.rect.width > (tempRect.width + 28)) ? "middle" :
                    (placement == "bottom") ? "bottom" :
                        (placement == "top") ? "top" :
                            (distance.top >= distance.bottom) ? "top" :
                                "bottom"
            );

    var label = /*this.*/setLabel({
        container: container,
        target: ruler.element,
        styles: styles,
        text: text,
        placement: markPlacement
    });

    /*this.*/removeLayer(temp);
    container.fixGeometryWithOptions(0);
}
export function spacings(options) {
    var options = /*this.*/extend(options, {}),
        placement = options.placement,
        styles = options.styles,
        target = options.target,
        layer = options.layer,
        byPercentage = options.byPercentage,
        targetObjectID = target.objectID(),
        layerObjectID = layer.objectID(),
        objectID = targetObjectID + "#" + layerObjectID,
        prefix = placement.toUpperCase() + "#",
        sizeType = (placement == "top" || placement == "bottom") ? "height" : "width",
        targetRect = /*this.*/getRect(target),
        layerRect = /*this.*/getRect(layer),
        distance = /*this.*/getDistance(targetRect, layerRect),
        isIntersect = /*this.*/isIntersect(targetRect, layerRect),
        tempX = targetRect.x,
        tempY = targetRect.y,
        tempWidth = targetRect.width,
        tempHeight = targetRect.height,
        render = true;

    if (/*this.*/is(layer, MSPage)) return false;

    if (isIntersect) {
        switch (placement) {
            case "top":
                tempY = targetRect.y - distance.top;
                tempHeight = distance.top;
                break;
            case "right":
                tempX = targetRect.x + targetRect.width;
                tempWidth = distance.right;
                break;
            case "bottom":
                tempY = targetRect.y + targetRect.height;
                tempHeight = distance.bottom;
                break;
            case "left":
                tempX = targetRect.x - distance.left;
                tempWidth = distance.left;
                break;
            default:
                render = false;
                break;
        }
        if (!tempWidth || !tempHeight) {
            render = false;
        }
    } else {
        switch (placement) {
            case "left" || "right":
                prefix = "HORIZONTAL#";
                if (targetRect.maxX < layerRect.x) {
                    tempX = targetRect.maxX;
                    tempWidth = layerRect.x - targetRect.maxX;
                } else if (targetRect.x > layerRect.maxX) {
                    tempX = layerRect.maxX;
                    tempWidth = targetRect.x - layerRect.maxX;
                } else {
                    render = false;
                }
                break;
            case "top" || "bottom":
                prefix = "VERTICAL#";
                if (targetRect.maxY < layerRect.y) {
                    tempY = targetRect.maxY;
                    tempHeight = layerRect.y - targetRect.maxY;
                } else if (targetRect.y > layerRect.maxY) {
                    tempY = layerRect.maxY;
                    tempHeight = targetRect.y - layerRect.maxY;
                } else {
                    render = false;
                }
                break;
            default:
                render = false;
                break;
        }
    }

    if (render) {
        var temp = /*this.*/addShape(),
            tempRect = /*this.*/getRect(temp);
        /*this.*/context.current.addLayers([temp]);

        tempRect.setX(tempX);
        tempRect.setY(tempY);
        tempRect.setWidth(tempWidth);
        tempRect.setHeight(tempHeight);

        /*this.*/sizes({
            name: prefix + objectID,
            type: sizeType,
            target: temp,
            styles: styles,
            byPercentage: byPercentage
        });

        /*this.*/removeLayer(temp);
    }
}
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
