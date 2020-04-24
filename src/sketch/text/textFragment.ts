// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

export interface TextFragment {
    length: number;
    location: number;
    text: string;
    style: Style;
    defaultLineHeight: number;
}
export function getFragmentsCount(layer: Layer): number {
    let fragments: any[] = layer.sketchObject.attributedString().treeAsDictionary().value.attributes;
    return fragments.length;
}
export function getFragments(layer: Layer): TextFragment[] {
    let fragments: any[] = layer.sketchObject.attributedString().treeAsDictionary().value.attributes;
    let results: TextFragment[] = [];
    let styleStr = JSON.stringify(layer.style);
    for (let i = 0; i < fragments.length; i++) {
        let fragment = fragments[i];
        let styleBase = JSON.parse(styleStr);
        let fontFamily = (fragment.NSFont && fragment.NSFont.family) ? fragment.NSFont.family : layer.style.fontFamily;
        let fontSize = (fragment.NSFont && fragment.NSFont.attributes && fragment.NSFont.attributes.NSFontSizeAttribute) ?
            fragment.NSFont.attributes.NSFontSizeAttribute : layer.style.fontSize;
        let textColor = (fragment.MSAttributedStringColorAttribute && fragment.MSAttributedStringColorAttribute.value) ?
            parseColor(fragment.MSAttributedStringColorAttribute.value) : '#000000FF';
        results.push(<TextFragment>{
            location: fragment.location,
            length: fragment.length,
            text: fragment.text,
            style: Object.assign(styleBase, <Style>{
                textColor: textColor,
                fontSize: fontSize,
                fontFamily: fontFamily,
                textStrikethrough: fragment.NSStrikethrough ? 'single' : null,
                textUnderline: fragment.NSUnderline ? 'single' : null,
            }),
            // cannot use layer.style.getDefaultLineHeight()
            // because we need every different default line height of fragment
            // not the whole style default.
            defaultLineHeight: getDefaultLineHeightForFont(fontFamily, fontSize),
        });
    }
    return results;
}

/**
 * parse MSAttributedStringColorAttribute to rgba-hex, e.g.: `#808080FF`
 * @param color can be `#808080`, `rgba(128,128,128,0.10)`
 */
function parseColor(color: string): string {
    color = new String(color).toString();
    if (color.startsWith('#')) return color + 'FF';
    let values = color.substring(5, color.length - 1).split(',').map(Number);
    values[3] = values[3] * 255;
    let red = (values[0] < 16 ? '0' : '') + values[0].toString(16);
    let green = (values[1] < 16 ? '0' : '') + values[1].toString(16);
    let blue = (values[2] < 16 ? '0' : '') + values[2].toString(16);
    let alpha = (values[3] < 16 ? '0' : '') + values[3].toString(16);
    color = '#' + red + green + blue + alpha;
    return color.toLocaleUpperCase();
}
function getDefaultLineHeightForFont(fontFamily, size) {
    let font = NSFont.fontWithName_size(fontFamily, size);
    let lm = NSLayoutManager.alloc().init();
    return lm.defaultLineHeightForFont(font);
}
