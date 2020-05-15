import { unitSize } from "../helper";
import { LayerData } from "../../../src/meaxure/interfaces";
import { scaleSize } from "../../events/helper";
import { propertyType } from "./shared";

export function renderCodeTemplate(layerData: LayerData): string {
    if (!layerData.css || !layerData.css.length) return '';
    var tab = ['<ul class="tab" id="code-tab" >',
        '<li class="icon-css-panel" data-id="css-panel" data-codeType="css"></li>',
        '<li class="icon-android-panel" data-id="android-panel" data-codeType="android" ></li>',
        '<li class="icon-ios-panel" data-id="ios-panel" data-codeType="ios" ></li>',
        '</ul>'
    ].join('');
    var css = [
        '<div id="css-panel" class="code-item item">',
        '<label><textarea id="css" rows="' + (layerData.css.length + 1) + '" readonly="readonly">' + layerData.css.join("\r\n") + '</textarea></label>',
        '</div>'
    ].join('');
    var android = [];
    if (layerData.type == "text") {
        android.push('<div id="android-panel"  class="code-item item">', '<label><textarea id="css" rows="6" readonly="readonly">' +
            "&lt;TextView\r\n" + getAndroidWithHeight(layerData) +
            "android:text=\"" + layerData.content + "\"\r\n" + "android:textColor=\"" + layerData.color["argb-hex"] + "\"\r\n" +
            "android:textSize=\"" + unitSize(layerData.fontSize, true) + "\"\r\n" + "/&gt;" + '</textarea></label>', '</div>');
    } else if (layerData.type == "shape") {
        android.push('<div id="android-panel" class="code-item item">', '<label><textarea id="css" rows="6" readonly="readonly">' +
            "&lt;View\r\n" + getAndroidWithHeight(layerData) +
            getAndroidShapeBackground(layerData) +
            "/&gt;" + '</textarea></label>', '</div>');
    } else if (layerData.type == "slice") {
        android.push('<div id="android-panel" class="code-item item">', '<label><textarea id="css" rows="6" readonly="readonly">' +
            "&lt;ImageView\r\n" + getAndroidWithHeight(layerData) +
            getAndroidImageSrc(layerData) + "/&gt;" +
            '</textarea></label>', '</div>');
    }
    var ios = [];
    if (layerData.type == "text") {
        ios.push('<div id="ios-panel"  class="code-item item">', '<label><textarea id="css" rows="6" readonly="readonly">' +
            "UILabel *label = [[UILabel alloc] init];\r\n" +
            "label.frame = CGRectMake(" + scaleSize(layerData.rect.x) + "\, " + scaleSize(layerData.rect.y) + "\, " +
            scaleSize(layerData.rect.width) + "\, " + scaleSize(layerData.rect.height) + ");\r\n" +
            "label.text = \@\"" + layerData.content + "\";\r\n" +
            "label.font = [UIFont fontWithName:\@\"" + layerData.fontFace + "\" size:" + scaleSize(layerData.fontSize) + "];\r\n" +
            "label.textColor = [UIColor colorWithRed:" + layerData.color.rgb.r + "/255.0 green:" + layerData.color.rgb.g + "/255.0 blue:" + layerData.color.rgb.b + "/255.0 alpha:" + layerData.color.alpha + "/255.0];\r\n" +
            '</textarea></label>', '</div>');
    } else if (layerData.type == "shape") {
        ios.push('<div id="ios-panel" class="code-item item">', '<label><textarea id="css" rows="6" readonly="readonly">' +
            "UIView *view = [[UIView alloc] init];\r\n" +
            "view.frame = CGRectMake(" + scaleSize(layerData.rect.x) + "\, " + scaleSize(layerData.rect.y) + "\, " +
            scaleSize(layerData.rect.width) + "\, " + scaleSize(layerData.rect.height) + ");\r\n" +
            getIOSShapeBackground(layerData) +
            '</textarea></label>', '</div>');
    } else if (layerData.type == "slice") {
        ios.push('<div id="ios-panel" class="code-item item">', '<label><textarea id="css" rows="6" readonly="readonly">' +
            "UIImageView *imageView = [[UIImageView alloc] init];\r\n" +
            "imageView.frame = CGRectMake(" + scaleSize(layerData.rect.x) + "\, " + scaleSize(layerData.rect.y) + "\, " +
            scaleSize(layerData.rect.width) + "\, " + scaleSize(layerData.rect.height) + ");\r\n" +
            getIOSImageSrc(layerData) +
            '</textarea></label>', '</div>');
    }
    return propertyType('CODE TEMPLATE', [tab, css, android.join(''), ios.join('')].join(''), true);
}
function getAndroidWithHeight(layerData: LayerData) {
    return "android:layout_width=\"" + unitSize(layerData.rect.width, false) + "\"\r\n" + "android:layout_height=\"" + unitSize(layerData.rect.height, false) + "\"\r\n";
}
function getAndroidShapeBackground(layerData: LayerData) {
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
function getAndroidImageSrc(layerData: LayerData) {
    if (layerData.type != "slice" || typeof (layerData.exportable) == 'undefined') return "";
    return "android:src=\"\@mipmap/" + layerData.exportable[0].name + "." + layerData.exportable[0].format + "\"\r\n";
}
function getIOSShapeBackground(layerData: LayerData) {
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
function getIOSImageSrc(layerData: LayerData) {
    if (layerData.type != "slice" || typeof (layerData.exportable) == 'undefined') return "";
    return "imageView.image = [UIImage imageNamed:\@\"" + layerData.exportable[0].name + "." + layerData.exportable[0].format + "\"];\r\n";
}