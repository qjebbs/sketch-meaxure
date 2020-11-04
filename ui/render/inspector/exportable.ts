import { LayerData } from "../../../src/meaxure/interfaces";
import { propertyType } from "./shared";
export function renderExportable(layerData: LayerData): string {
    if (!layerData.exportable || !layerData.exportable.length)
        return '';
    var expHTML = [], path = 'assets/';
    expHTML.push('<ul class="exportable">');
    layerData.exportable.forEach(exportable => {
        var filePath = path + exportable.path;
        expHTML.push('<li>', '<a href="' + filePath + '"target="_blank" data-format="' + exportable.format.toUpperCase() + '"><img src="' + filePath + '" alt="' + exportable.path + '">' + exportable.path.replace('drawable-', '') + '</a>', '</li>');
    });
    expHTML.push('</ul>');
    return propertyType('EXPORTABLE', expHTML.join(''));
}
