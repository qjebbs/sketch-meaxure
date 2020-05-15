import { localize } from "../../common";
import { LayerData } from "../../../src/meaxure/interfaces";
import { unitSize } from "../helper";
import { colorItem, propertyType } from "./shared";
export function renderShadows(layerData: LayerData): string {
    if (!layerData.shadows || !layerData.shadows.length)
        return '';
    var shadows = [];
    for (let i = layerData.shadows.length - 1; i >= 0; i--) {
        let shadow = layerData.shadows[i];
        shadows.push('<div class="items-group">', '<h4>' + localize(shadow.type + ' Shadow') + '</h4>', '<div class="item" data-label="' + localize('Offset') + ':">', '<label data-label="' + localize('X') + '"><input id="offset-x" type="text" value="' + unitSize(shadow.offsetX) + '" readonly="readonly"></label>', '<label data-label="' + localize('Y') + '"><input id="offset-y" type="text" value="' + unitSize(shadow.offsetY) + '" readonly="readonly"></label>', '</div>', '<div class="item" data-label="' + localize('Effect') + ':">', '<label data-label="' + localize('Blur') + '"><input id="offset-x" type="text" value="' + unitSize(shadow.blurRadius) + '" readonly="readonly"></label>', '<label data-label="' + localize('Spread') + '"><input id="offset-y" type="text" value="' + unitSize(shadow.spread) + '" readonly="readonly"></label>', '</div>', '<div class="item" data-label="' + localize('Color') + ':">', colorItem(shadow.color), '</div>', '</div>');
    }
    return propertyType('SHADOWS', shadows.join(''));
}
