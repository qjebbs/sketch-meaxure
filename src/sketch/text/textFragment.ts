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
export function getFragments(layer: Layer): TextFragment[] {
    let fragments: any[] = layer.sketchObject.attributedString().treeAsDictionary().value.attributes;
    let results: TextFragment[] = [];
    for (let i = 0; i < fragments.length; i++) {
        let fragment = fragments[i];
        let styleBase = JSON.parse(JSON.stringify(layer.style));
        let fontFamily = fragment.NSFont.family;
        let fontSize = fragment.NSFont.attributes.NSFontSizeAttribute;
        results.push(<TextFragment>{
            location: fragment.location,
            length: fragment.length,
            text: fragment.text,
            style: Object.assign(styleBase, <Style>{
                textColor: `${fragment.MSAttributedStringColorAttribute.value}FF`,
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
function getDefaultLineHeightForFont(fontFamily, size) {
    let font = NSFont.fontWithName_size(fontFamily, size);
    let lm = NSLayoutManager.alloc().init();
    return lm.defaultLineHeightForFont(font);
}
