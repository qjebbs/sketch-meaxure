import { state } from "../common";
import { localize, project } from "../common";
import { SMColor } from "../../src/meaxure/interfaces";
import { unitSize } from "./helper";
import { getAndroidWithHeight, getAndroidShapeBackground, getAndroidImageSrc, getIOSShapeBackground, getIOSImageSrc } from "../events/codes";
import { scaleSize } from "../events/helper";

export function inspector() {
    if (state.selectedIndex === undefined || (!state.current && !state.current.layers && !state.current.layers[state.selectedIndex])) return false;
    let layerData = state.current.layers[state.selectedIndex];
    let html = [];
    html.push('<h2>' + layerData.name + '</h2>');
    // fix 0 [opacity]
    // PROPERTIES
    var position = [
        '<div class="item" data-label="' + localize('Position') + ':">',
        '<label data-label="' + localize('X') + '"><input id="position-x" type="text" value="' + unitSize(layerData.rect.x) + '" readonly="readonly"></label>',
        '<label data-label="' + localize('Y') + '"><input id="position-y" type="text" value="' + unitSize(layerData.rect.y) + '" readonly="readonly"></label>',
        '</div>'
    ].join(''),
        size = [
            '<div class="item" data-label="' + localize('Size') + ':">',
            '<label data-label="' + localize('Width') + '"><input id="size-width" type="text" value="' + unitSize(layerData.rect.width) + '" readonly="readonly"></label>',
            '<label data-label="' + localize('Height') + '"><input id="size-height" type="text" value="' + unitSize(layerData.rect.height) + '" readonly="readonly"></label>',
            '</div>'
        ].join(''),
        opacity = (typeof layerData.opacity == 'number') ? [
            '<div class="item" data-label="' + localize('Opacity') + ':">',
            '<label><input id="opacity" type="text" value="' + Math.round(layerData.opacity * 10000) / 100 + '%" readonly="readonly"></label>',
            '<label></label>',
            '</div>'
        ].join('') : '',
        radius = (layerData.radius) ? [
            '<div class="item" data-label="' + localize('Radius') + ':">',
            '<label><input id="radius" type="text" value="' + unitSize(layerData.radius[0]) + '" readonly="readonly"></label>',
            '<label></label>',
            '</div>'
        ].join('') : '',
        styleName = (layerData.styleName) ? [
            '<div class="item" data-label="' + localize('Style') + ':">',
            '<label><input id="styleName" type="text" value="' + layerData.styleName + '" readonly="readonly"></label>',
            '</div>'
        ].join('') : '';
    html.push(propertyType('PROPERTIES', [position, size, opacity, radius, styleName].join('')));
    // FILLS
    if (layerData.fills && layerData.fills.length > 0) {
        var fills = [];
        let fillsData = layerData.fills;
        for (let i = fillsData.length - 1; i >= 0; i--) {
            let fill = fillsData[i];
            fills.push('<div class="item items-group" data-label="' + localize(fill.fillType) + ':">');
            if (fill.fillType.toLowerCase() == "color") {
                fills.push(colorItem(fill.color));
            } else {
                fills.push('<div class="gradient">');
                fill.gradient.colorStops.forEach(
                    gradient => fills.push(colorItem(gradient.color))
                );
                fills.push('</div>');
            }
            fills.push('</div>');
        }
        html.push(propertyType('FILLS', fills.join('')));
    }
    // TYPEFACE
    if (layerData.type == 'text') {
        var fontFamily = [
            '<div class="item" data-label="' + localize('Family') + ':">',
            '<label><input id="font-family" type="text" value="' + layerData.fontFace + '" readonly="readonly"></label>',
            '</div>'
        ].join(''),
            textColor = [
                '<div class="item" data-label="' + localize('Color') + ':">',
                '<div class="color">',
                colorItem(layerData.color),
                '</div>',
                '</div>'
            ].join(''),
            fontSize = (layerData.fontSize) ? [
                '<div class="item" data-label="' + localize('Size') + ':">',
                '<label><input id="opacity" type="text" value="' + unitSize(layerData.fontSize, true) + '" readonly="readonly"></label>',
                '<label></label>',
                '</div>'
            ].join('') : '',
            spacing = [
                '<div class="item" data-label="' + localize('Spacing') + ':">',
                '<label data-label="' + localize('Character') + '"><input id="letter-spacing" type="text" value="' + unitSize(layerData.letterSpacing, true) + '" readonly="readonly"></label>',
                '<label data-label="' + localize('Line') + '"><input id="line-height" type="text" value="' + (layerData.lineHeight ? unitSize(layerData.lineHeight, true) : 'Auto') + '" readonly="readonly"></label>',
                '</div>'
            ].join(''),
            content = [
                '<div class="item">',
                '<label data-label="' + localize('Content') + '"><textarea id="content" rows="2" readonly="readonly" style="font-family: ' + layerData.fontFace + ', sans-serif">' + layerData.content + '</textarea></label>',
                '</div>'
            ].join('');
        html.push(propertyType('TYPEFACE', [fontFamily, textColor, fontSize, spacing, content].join('')));
    }
    // BORDERS
    if (layerData.borders && layerData.borders.length > 0) {
        var borders = [];
        for (let i = layerData.borders.length - 1; i >= 0; i--) {
            let border = layerData.borders[i];
            borders.push(
                '<div class="items-group">',
                '<h4>' + localize(border.position + ' Border') + '</h4>',
                '<div class="item" data-label="' + localize('Weight') + ':">',
                '<label><input id="font-family" type="text" value="' + unitSize(border.thickness) + '" readonly="readonly"></label>',
                '<label></label>',
                '</div>');
            borders.push('<div class="item" data-label="' + localize(border.fillType) + ':">');
            if (border.fillType.toLowerCase() == "color") {
                borders.push(colorItem(border.color));
            } else {
                borders.push('<div class="colors gradient">');
                border.gradient.colorStops.forEach(
                    gradient => borders.push(colorItem(gradient.color))
                );
                borders.push('</div>');
            }
            borders.push('</div>');
            borders.push('</div>');
        }
        html.push(propertyType('BORDERS', borders.join('')));
    }
    // SHADOWS
    if (layerData.shadows && layerData.shadows.length > 0) {
        var shadows = [];
        for (let i = layerData.shadows.length - 1; i >= 0; i--) {
            let shadow = layerData.shadows[i];
            shadows.push(
                '<div class="items-group">',
                '<h4>' + localize(shadow.type + ' Shadow') + '</h4>',
                '<div class="item" data-label="' + localize('Offset') + ':">',
                '<label data-label="' + localize('X') + '"><input id="offset-x" type="text" value="' + unitSize(shadow.offsetX) + '" readonly="readonly"></label>',
                '<label data-label="' + localize('Y') + '"><input id="offset-y" type="text" value="' + unitSize(shadow.offsetY) + '" readonly="readonly"></label>',
                '</div>',
                '<div class="item" data-label="' + localize('Effect') + ':">',
                '<label data-label="' + localize('Blur') + '"><input id="offset-x" type="text" value="' + unitSize(shadow.blurRadius) + '" readonly="readonly"></label>',
                '<label data-label="' + localize('Spread') + '"><input id="offset-y" type="text" value="' + unitSize(shadow.spread) + '" readonly="readonly"></label>',
                '</div>',
                '<div class="item" data-label="' + localize('Color') + ':">',
                colorItem(shadow.color),
                '</div>',
                '</div>'
            );
        }
        html.push(propertyType('SHADOWS', shadows.join('')));
    }
    // CODE TEMPLATE
    if (layerData.css && layerData.css.length > 0) {
        var tab = ['<ul class="tab" id="code-tab" >',
            '<li class="icon-css-panel" data-id="css-panel" data-codeType="css"></li>',
            '<li class="icon-android-panel" data-id="android-panel" data-codeType="android" ></li>',
            '<li class="icon-ios-panel" data-id="ios-panel" data-codeType="ios" ></li>',
            '</ul>'
        ].join('')
        var css = [
            '<div id="css-panel" class="code-item item">',
            '<label><textarea id="css" rows="' + (layerData.css.length + 1) + '" readonly="readonly">' + layerData.css.join("\r\n") + '</textarea></label>',
            '</div>'
        ].join('');

        var android = [];
        if (layerData.type == "text") {
            android.push(
                '<div id="android-panel"  class="code-item item">',
                '<label><textarea id="css" rows="6" readonly="readonly">' +
                "&lt;TextView\r\n" + getAndroidWithHeight(layerData) +
                "android:text=\"" + layerData.content + "\"\r\n" + "android:textColor=\"" + layerData.color["argb-hex"] + "\"\r\n" +
                "android:textSize=\"" + unitSize(layerData.fontSize, true) + "\"\r\n" + "/&gt;" + '</textarea></label>',
                '</div>'
            );
        } else if (layerData.type == "shape") {
            android.push(
                '<div id="android-panel" class="code-item item">',
                '<label><textarea id="css" rows="6" readonly="readonly">' +
                "&lt;View\r\n" + getAndroidWithHeight(layerData) +
                getAndroidShapeBackground(layerData) +
                "/&gt;" + '</textarea></label>',
                '</div>'
            );
        } else if (layerData.type == "slice") {
            android.push(
                '<div id="android-panel" class="code-item item">',
                '<label><textarea id="css" rows="6" readonly="readonly">' +
                "&lt;ImageView\r\n" + getAndroidWithHeight(layerData) +
                getAndroidImageSrc(layerData) + "/&gt;" +
                '</textarea></label>',
                '</div>'
            );
        }

        var ios = [];
        if (layerData.type == "text") {
            ios.push(
                '<div id="ios-panel"  class="code-item item">',
                '<label><textarea id="css" rows="6" readonly="readonly">' +
                "UILabel *label = [[UILabel alloc] init];\r\n" +
                "label.frame = CGRectMake(" + scaleSize(layerData.rect.x) + "\, " + scaleSize(layerData.rect.y) + "\, " +
                scaleSize(layerData.rect.width) + "\, " + scaleSize(layerData.rect.height) + ");\r\n" +
                "label.text = \@\"" + layerData.content + "\";\r\n" +
                "label.font = [UIFont fontWithName:\@\"" + layerData.fontFace + "\" size:" + scaleSize(layerData.fontSize) + "];\r\n" +
                "label.textColor = [UIColor colorWithRed:" + layerData.color.r + "/255.0 green:" + layerData.color.g + "/255.0 blue:" + layerData.color.b + "/255.0 alpha:" + layerData.color.a + "/1.0];\r\n" +
                '</textarea></label>',
                '</div>'
            );
        } else if (layerData.type == "shape") {
            ios.push(
                '<div id="ios-panel" class="code-item item">',
                '<label><textarea id="css" rows="6" readonly="readonly">' +
                "UIView *view = [[UIView alloc] init];\r\n" +
                "view.frame = CGRectMake(" + scaleSize(layerData.rect.x) + "\, " + scaleSize(layerData.rect.y) + "\, " +
                scaleSize(layerData.rect.width) + "\, " + scaleSize(layerData.rect.height) + ");\r\n" +
                getIOSShapeBackground(layerData) +
                '</textarea></label>',
                '</div>'
            );
        } else if (layerData.type == "slice") {
            ios.push(
                '<div id="ios-panel" class="code-item item">',
                '<label><textarea id="css" rows="6" readonly="readonly">' +
                "UIImageView *imageView = [[UIImageView alloc] init];\r\n" +
                "imageView.frame = CGRectMake(" + scaleSize(layerData.rect.x) + "\, " + scaleSize(layerData.rect.y) + "\, " +
                scaleSize(layerData.rect.width) + "\, " + scaleSize(layerData.rect.height) + ");\r\n" +
                getIOSImageSrc(layerData) +
                '</textarea></label>',
                '</div>'
            );
        }
        html.push(propertyType('CODE TEMPLATE', [tab, css, android.join(''), ios.join('')].join(''), true));
    }
    //  EXPORTABLE
    if (layerData.exportable && layerData.exportable.length > 0) {
        var expHTML = [],
            path = 'assets/'
        expHTML.push('<ul class="exportable">')
        layerData.exportable.forEach(
            exportable => {
                var filePath = path + exportable.path;
                expHTML.push(
                    '<li>',
                    '<a href="' + filePath + '"target="_blank" data-format="' + exportable.format.toUpperCase() + '"><img src="' + filePath + '" alt="' + exportable.path + '">' + exportable.path.replace('drawable-', '') + '</a>',
                    '</li>');
            }
        );
        expHTML.push('</ul>')
        html.push(propertyType('EXPORTABLE', expHTML.join('')));
    }
    renderInspector(html);
}

function colorItem(color: SMColor) {
    var colorName = (project.colorNames) ? project.colorNames[color['argb-hex']] : '';
    colorName = (colorName) ? ' data-name="' + colorName + '"' : '';
    return [
        '<div class="color"' + colorName + '>',
        '<label><em><i style="background-color:' + color['css-rgba'] + ';"></i></em></label><input data-color="' + encodeURI(JSON.stringify(color)) + '" type="text" value="' + color[state.colorFormat] + '" readonly="readonly">',
        '</div>'
    ].join('');
}

function renderInspector(html: string[]) {
    let inspector = document.querySelector('#inspector');
    inspector.classList.add('active');
    inspector.innerHTML = html.join('');

    // select previously used tab
    let li = inspector.querySelector('[data-codeType=' + state.codeType + ']') as HTMLElement;
    if (li) {
        li.classList.add('select');
        inspector.querySelector("#" + li.getAttribute('data-id')).classList.add('select');
    }
    let onclick = function () {
        let target = this as HTMLElement;
        let id = target.getAttribute('data-id');
        state.codeType = target.getAttribute('data-codeType');
        target.parentElement.querySelector('li.select').classList.remove('select');
        target.classList.add('select');
        inspector.querySelector('div.item.select')?.classList.remove('select');
        inspector.querySelector("#" + id).classList.add('select');
    }
    document.querySelectorAll('#code-tab li').forEach(
        li => li.addEventListener('click', onclick)
    );
}

function propertyType(title, content, isCode?) {
    var nopadding = isCode ? ' style="padding:0"' : '';
    return ['<section>',
        '<h3>' + localize(title) + '</h3>',
        '<div class="context"' + nopadding + '>',
        content,
        '</div>',
        '</section>'
    ].join('');
}