// import { _ } from "../state/language";
// import { colors } from "../state/common";
// import { context } from "../state/context";
// import { sharedLayerStyle, sharedTextStyle } from "./base";
// import { message, extend, getDistance } from "../api/helper";
// import { getRect, is, addShape, removeLayer } from "../api/api";
// // export function markSpacings() {
// //     var selection = /*this.*/ context.selection;
// //     if (!(selection.count() > 0 && selection.count() < 3)) {
// //         /*this.*/ message(_("Select 1 or 2 layers to make marks!"));
// //         return false;
// //     }
// //     if ( /*this.*/spacingsPanel()) {
// //         var target = (selection.count() == 1) ? selection[0] : selection[1], layer = (selection.count() == 1) ? /*this.*/ context.current : selection[0], placements = ["top", "right", "bottom", "left"], spacingStyles = {
// //             layer: /*this.*/ sharedLayerStyle("Sketch Measure / Spacing", /*this.*/ colors.spacing.layer),
// //             text: /*this.*/ sharedTextStyle("Sketch Measure / Spacing", /*this.*/ colors.spacing.text, 2)
// //         };
// //         if ( /*this.*/isIntersect(/*this.*/ getRect(target), /*this.*/ getRect(layer))) {
// //             placements = /*this.*/ context.runningConfig.spacings.placements;
// //         }
// //         placements.forEach(function (placement) {
// //             /*self.*/ spacings({
// //             target: target,
// //             layer: layer,
// //             placement: placement,
// //             styles: spacingStyles,
// //             byPercentage: /*this.*/ context.runningConfig.spacings.byPercentage
// //         });
// //         });
// //     }
// // }
// export function liteSpacings() {
//     var selection = /*this.*/ context.selection;
//     if (!(selection.count() > 0 && selection.count() < 3)) {
//         /*this.*/ message(_("Select 1 or 2 layers to make marks!"));
//         return false;
//     }
//     var target = (selection.count() == 1) ? selection[0] : selection[1], layer = (selection.count() == 1) ? /*this.*/ context.current : selection[0], spacingStyles = {
//         layer: /*this.*/ sharedLayerStyle("Sketch Measure / Spacing", /*this.*/ colors.spacing.shape),
//         text: /*this.*/ sharedTextStyle("Sketch Measure / Spacing", /*this.*/ colors.spacing.text, 2)
//     };
//     let placements = ["top", "right", "bottom", "left"];
//     placements.forEach(function (placement) {
//         /*self.*/ spacings({
//         target: target,
//         layer: layer,
//         placement: placement,
//         styles: spacingStyles,
//         byPercentage: false
//     });
//     });
// }


// export function spacings(options) {
//     var options = /*this.*/extend(options, {}),
//         placement = options.placement,
//         styles = options.styles,
//         target = options.target,
//         layer = options.layer,
//         byPercentage = options.byPercentage,
//         targetObjectID = target.objectID(),
//         layerObjectID = layer.objectID(),
//         objectID = targetObjectID + "#" + layerObjectID,
//         prefix = placement.toUpperCase() + "#",
//         sizeType = (placement == "top" || placement == "bottom") ? "height" : "width",
//         targetRect = /*this.*/getRect(target),
//         layerRect = /*this.*/getRect(layer),
//         distance = /*this.*/getDistance(targetRect, layerRect),
//         isIntersect = /*this.*/isIntersect(targetRect, layerRect),
//         tempX = targetRect.x,
//         tempY = targetRect.y,
//         tempWidth = targetRect.width,
//         tempHeight = targetRect.height,
//         render = true;

//     if (/*this.*/is(layer, MSPage)) return false;

//     if (isIntersect) {
//         switch (placement) {
//             case "top":
//                 tempY = targetRect.y - distance.top;
//                 tempHeight = distance.top;
//                 break;
//             case "right":
//                 tempX = targetRect.x + targetRect.width;
//                 tempWidth = distance.right;
//                 break;
//             case "bottom":
//                 tempY = targetRect.y + targetRect.height;
//                 tempHeight = distance.bottom;
//                 break;
//             case "left":
//                 tempX = targetRect.x - distance.left;
//                 tempWidth = distance.left;
//                 break;
//             default:
//                 render = false;
//                 break;
//         }
//         if (!tempWidth || !tempHeight) {
//             render = false;
//         }
//     } else {
//         switch (placement) {
//             case "left" || "right":
//                 prefix = "HORIZONTAL#";
//                 if (targetRect.maxX < layerRect.x) {
//                     tempX = targetRect.maxX;
//                     tempWidth = layerRect.x - targetRect.maxX;
//                 } else if (targetRect.x > layerRect.maxX) {
//                     tempX = layerRect.maxX;
//                     tempWidth = targetRect.x - layerRect.maxX;
//                 } else {
//                     render = false;
//                 }
//                 break;
//             case "top" || "bottom":
//                 prefix = "VERTICAL#";
//                 if (targetRect.maxY < layerRect.y) {
//                     tempY = targetRect.maxY;
//                     tempHeight = layerRect.y - targetRect.maxY;
//                 } else if (targetRect.y > layerRect.maxY) {
//                     tempY = layerRect.maxY;
//                     tempHeight = targetRect.y - layerRect.maxY;
//                 } else {
//                     render = false;
//                 }
//                 break;
//             default:
//                 render = false;
//                 break;
//         }
//     }

//     if (render) {
//         var temp = /*this.*/addShape(),
//             tempRect = /*this.*/getRect(temp);
//         /*this.*/context.current.addLayers([temp]);

//         tempRect.setX(tempX);
//         tempRect.setY(tempY);
//         tempRect.setWidth(tempWidth);
//         tempRect.setHeight(tempHeight);

//         /*this.*/sizes({
//             name: prefix + objectID,
//             type: sizeType,
//             target: temp,
//             styles: styles,
//             byPercentage: byPercentage
//         });

//         /*this.*/removeLayer(temp);
//     }
// }