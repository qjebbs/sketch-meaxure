import { unitSize } from "../render/helper";

export function getAndroidWithHeight(layerData) {
    return "android:layout_width=\"" + unitSize(layerData.rect.width, false) + "\"\r\n" + "android:layout_height=\"" + unitSize(layerData.rect.height, false) + "\"\r\n";
}
export function getAndroidShapeBackground(layerData) {
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
export function getAndroidImageSrc(layerData) {
    if (layerData.type != "slice" || typeof (layerData.exportable) == 'undefined' || layerData.exportable == 0) return "";
    return "android:src=\"\@mipmap/" + layerData.exportable[0].name + "." + layerData.exportable[0].format + "\"\r\n";
}
export function getIOSShapeBackground(layerData) {
    var colorCode = "";
    if (layerData.type != "shape" || typeof (layerData.fills) == 'undefined' || layerData.fills.length == 0) return colorCode;
    var f;
    for (f in layerData.fills) {
        if (layerData.fills[f].fillType.toLowerCase() == "color") {
            return "view.backgroundColor = [UIColor colorWithRed:" + layerData.fills[f].color.r + "/255.0 green:" + layerData.fills[f].color.g + "/255.0 blue:" + layerData.fills[f].color.b + "/255.0 alpha:" + layerData.fills[f].color.a + "/1.0]\;\r\n";
        }
    }
    return colorCode;
}
export function getIOSImageSrc(layerData) {
    if (layerData.type != "slice" || typeof (layerData.exportable) == 'undefined' || layerData.exportable == 0) return "";
    return "imageView.image = [UIImage imageNamed:\@\"" + layerData.exportable[0].name + "." + layerData.exportable[0].format + "\"];\r\n";
}