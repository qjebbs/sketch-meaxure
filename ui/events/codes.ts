import { unitSize } from "../render/helper";
import { LayerData } from "../../src/meaxure/interfaces";

export function getAndroidWithHeight(layerData: LayerData) {
    return "android:layout_width=\"" + unitSize(layerData.rect.width, false) + "\"\r\n" + "android:layout_height=\"" + unitSize(layerData.rect.height, false) + "\"\r\n";
}
export function getAndroidShapeBackground(layerData: LayerData) {
    var colorCode = "";
    if (layerData.type != "shape" || typeof (layerData.fills) == 'undefined' || layerData.fills.length == 0) return colorCode;
    var f;
    for (f in layerData.fills) {
        if (layerData.fills[f].fillType.toLowerCase() == "color") {
            return "android:background=\"" + layerData.fills[f].color["argb-hex"] + "\"\r\n";
        }
    }
    return colorCode;
}
export function getAndroidImageSrc(layerData: LayerData) {
    if (layerData.type != "slice" || typeof (layerData.exportable) == 'undefined') return "";
    return "android:src=\"\@mipmap/" + layerData.exportable[0].name + "." + layerData.exportable[0].format + "\"\r\n";
}
export function getIOSShapeBackground(layerData: LayerData) {
    var colorCode = "";
    if (layerData.type != "shape" || typeof (layerData.fills) == 'undefined' || layerData.fills.length == 0) return colorCode;
    var f;
    for (f in layerData.fills) {
        if (layerData.fills[f].fillType.toLowerCase() == "color") {
            return "view.backgroundColor = [UIColor colorWithRed:" + layerData.fills[f].color.rgb.r + "/255.0 green:" + layerData.fills[f].color.rgb.g + "/255.0 blue:" + layerData.fills[f].color.rgb.b + "/255.0 alpha:" + layerData.fills[f].color.alpha + "/255.0]\;\r\n";
        }
    }
    return colorCode;
}
export function getIOSImageSrc(layerData: LayerData) {
    if (layerData.type != "slice" || typeof (layerData.exportable) == 'undefined') return "";
    return "imageView.image = [UIImage imageNamed:\@\"" + layerData.exportable[0].name + "." + layerData.exportable[0].format + "\"];\r\n";
}