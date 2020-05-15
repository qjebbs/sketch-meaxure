import { localize } from "../../common";
import { LayerData } from "../../../src/meaxure/interfaces";
import { unitSize } from "../helper";
import { colorItem, propertyType } from "./shared";
export function renderFont(layerData: LayerData): string {
    if (layerData.type != 'text')
        return '';
    var fontFamily = [
        '<div class="item" data-label="' + localize('Family') + ':">',
        '<label><input id="font-family" type="text" value="' + layerData.fontFace + '" readonly="readonly"></label>',
        '</div>'
    ].join(''), textColor = [
        '<div class="item" data-label="' + localize('Color') + ':">',
        '<div class="color">',
        colorItem(layerData.color),
        '</div>',
        '</div>'
    ].join(''), fontSize = (layerData.fontSize) ? [
        '<div class="item" data-label="' + localize('Size') + ':">',
        '<label><input id="opacity" type="text" value="' + unitSize(layerData.fontSize, true) + '" readonly="readonly"></label>',
        '<label></label>',
        '</div>'
    ].join('') : '', spacing = [
        '<div class="item" data-label="' + localize('Spacing') + ':">',
        '<label data-label="' + localize('Character') + '"><input id="letter-spacing" type="text" value="' + unitSize(layerData.letterSpacing, true) + '" readonly="readonly"></label>',
        '<label data-label="' + localize('Line') + '"><input id="line-height" type="text" value="' + (layerData.lineHeight ? unitSize(layerData.lineHeight, true) : 'Auto') + '" readonly="readonly"></label>',
        '</div>'
    ].join(''), content = [
        '<div class="item">',
        '<label data-label="' + localize('Content') + '"><textarea id="content" rows="2" readonly="readonly" style="font-family: ' + layerData.fontFace + ', sans-serif">' + layerData.content + '</textarea></label>',
        '</div>'
    ].join('');
    return propertyType('TYPEFACE', [fontFamily, textColor, fontSize, spacing, content].join(''));
}
