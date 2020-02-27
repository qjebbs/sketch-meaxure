// import { _ } from "../state/language";
// import { message, isIntersect } from "../helper";
// import { colors } from "../state/common";
// import { spacingsPanel } from "../panels/spacingsPanel";
// import { getRect } from "../api/api";
// import { context } from "../state/context";
// import { spacings, sharedLayerStyle, sharedTextStyle } from "./base";
// export function markSpacings() {
//     var selection = /*this.*/ context.selection;
//     if (!(selection.count() > 0 && selection.count() < 3)) {
//         /*this.*/ message(_("Select 1 or 2 layers to make marks!"));
//         return false;
//     }
//     if ( /*this.*/spacingsPanel()) {
//         var target = (selection.count() == 1) ? selection[0] : selection[1], layer = (selection.count() == 1) ? /*this.*/ context.current : selection[0], placements = ["top", "right", "bottom", "left"], spacingStyles = {
//             layer: /*this.*/ sharedLayerStyle("Sketch Measure / Spacing", /*this.*/ colors.spacing.layer),
//             text: /*this.*/ sharedTextStyle("Sketch Measure / Spacing", /*this.*/ colors.spacing.text, 2)
//         };
//         if ( /*this.*/isIntersect(/*this.*/ getRect(target), /*this.*/ getRect(layer))) {
//             placements = /*this.*/ context.runningConfig.spacings.placements;
//         }
//         placements.forEach(function (placement) {
//             /*self.*/ spacings({
//             target: target,
//             layer: layer,
//             placement: placement,
//             styles: spacingStyles,
//             byPercentage: /*this.*/ context.runningConfig.spacings.byPercentage
//         });
//         });
//     }
// }
// export function liteSpacings() {
//     var selection = /*this.*/ context.selection;
//     if (!(selection.count() > 0 && selection.count() < 3)) {
//         /*this.*/ message(_("Select 1 or 2 layers to make marks!"));
//         return false;
//     }
//     var target = (selection.count() == 1) ? selection[0] : selection[1], layer = (selection.count() == 1) ? /*this.*/ context.current : selection[0], spacingStyles = {
//         layer: /*this.*/ sharedLayerStyle("Sketch Measure / Spacing", /*this.*/ colors.spacing.layer),
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
