// import { _ } from "../state/language";
// import { message, getDistance } from "../helper";
// import { sizesPanel } from "../panels/sizesPanel";
// import { colors } from "../state/common";
// import { getRect } from "../api/api";
// import { context } from "../state/context";
// import { sizes, sharedLayerStyle, sharedTextStyle } from "./base";
// export function markSizes() {
//     var selection = /*this.*/ context.selection;
//     if (selection.count() <= 0) {
//         /*this.*/ message(_("Select a layer to make marks!"));
//         return false;
//     }
//     if ( /*this.*/sizesPanel()) {
//         var sizeStyles = {
//             layer: /*this.*/ sharedLayerStyle("Sketch Measure / Size", /*this.*/ colors.size.layer),
//             text: /*this.*/ sharedTextStyle("Sketch Measure / Size", /*this.*/ colors.size.text, 2)
//         };
//         for (var i = 0; i < selection.count(); i++) {
//             var target = selection[i], objectID = target.objectID();
//             if ( /*this.*/context.configs.sizes.widthPlacement) {
//                 /*this.*/ sizes({
//                 name: "WIDTH#" + objectID,
//                 type: "width",
//                 target: target,
//                 placement: /*this.*/ context.configs.sizes.widthPlacement,
//                 styles: sizeStyles,
//                 byPercentage: /*this.*/ context.configs.sizes.byPercentage
//             });
//             }
//             if ( /*this.*/context.configs.sizes.heightPlacement) {
//                 /*this.*/ sizes({
//                 name: "HEIGHT#" + objectID,
//                 type: "height",
//                 target: target,
//                 placement: /*this.*/ context.configs.sizes.heightPlacement,
//                 styles: sizeStyles,
//                 byPercentage: /*this.*/ context.configs.sizes.byPercentage
//             });
//             }
//         }
//     }
// }
// export function liteSizes() {
//     var selection = /*this.*/ context.selection;
//     if (selection.count() <= 0) {
//         /*this.*/ message(_("Select a layer to make marks!"));
//         return false;
//     }
//     var sizeStyles = {
//         layer: /*this.*/ sharedLayerStyle("Sketch Measure / Size", /*this.*/ colors.size.layer),
//         text: /*this.*/ sharedTextStyle("Sketch Measure / Size", /*this.*/ colors.size.text, 2)
//     };
//     for (var i = 0; i < selection.count(); i++) {
//         var target = selection[i], targetRect = /*self.*/ getRect(target), objectID = target.objectID(), distance = /*self.*/ getDistance(targetRect), widthPlacement = distance.top < distance.bottom ? "bottom" :
//             distance.top == distance.bottom ? "middle" :
//                 "top", heightPlacement = distance.left > distance.right ? "left" :
//                     distance.left == distance.right ? "center" :
//                         "right";
//         /*this.*/ sizes({
//                             name: "WIDTH#" + objectID,
//                             type: "width",
//                             target: target,
//                             placement: widthPlacement,
//                             styles: sizeStyles,
//                             byPercentage: false
//                         });
//         /*this.*/ sizes({
//                             name: "HEIGHT#" + objectID,
//                             type: "height",
//                             target: target,
//                             placement: heightPlacement,
//                             styles: sizeStyles,
//                             byPercentage: false
//                         });
//     }
// }
