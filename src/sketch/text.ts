import { sketch } from ".";

export interface TextFragment {
    length: number,
    location: number,
    text: string,
    style: Style,
    defaultLineHeight: number,
}

export enum TextBehaviour {
    autoWidth = 0,
    autoHeight = 1,
    fixedSize = 2,
}

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface Text {
            isEmpty: boolean;
            textBehaviour: TextBehaviour;
            getFragments(): TextFragment[];
        }
    }
}

export function extendText() {
    let target = sketch.Text.prototype
    Object.defineProperty(target, "isEmpty", {
        get: function () {
            return this.sketchObject.isEmpty();
        }
    });
    Object.defineProperty(target, "textBehaviour", {
        get: function () {
            let val = this.sketchObject.textBehaviour();
            return TextBehaviour[val];
        },
        set: function (val: TextBehaviour) {
            return this.sketchObject.setTextBehaviour(val);
        }
    });
    target.getFragments = function (): TextFragment[] {
        let fragments: any[] = (this as Layer).sketchObject.attributedString().treeAsDictionary().value.attributes;
        let results: TextFragment[] = [];
        for (let i = 0; i < fragments.length; i++) {
            let fragment = fragments[i];
            let styleBase = JSON.parse(JSON.stringify((this as Layer).style));
            let fontFamily = fragment.NSFont.family;
            let fontSize = fragment.NSFont.attributes.NSFontSizeAttribute;
            results.push(
                <TextFragment>{
                    location: fragment.location,
                    length: fragment.length,
                    text: fragment.text,
                    style: Object.assign(
                        styleBase,
                        <Style>{
                            textColor: `${fragment.MSAttributedStringColorAttribute.value}FF`,
                            fontSize: fontSize,
                            fontFamily: fontFamily,
                            textStrikethrough: fragment.NSStrikethrough ? 'single' : null,
                            textUnderline: fragment.NSUnderline ? 'single' : null,
                        }
                    ),
                    defaultLineHeight: getDefaultLineHeightForFont(fontFamily, fontSize),
                }
            );
        }
        return results;
    }
}
function getDefaultLineHeightForFont(fontFamily, size) {
    let font = NSFont.fontWithName_size(fontFamily, size);
    let lm = NSLayoutManager.alloc().init();
    return lm.defaultLineHeightForFont(font)
}