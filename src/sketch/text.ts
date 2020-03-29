import { sketch } from ".";
import { toJSNumber, toJSString } from "../api/api";

interface TextFragment {
    length: number,
    location: number,
    text: string,
    style: Style,
}

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface Text {
            isEmpty: boolean;
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
    target.getFragments = function (): TextFragment[] {
        let fragments: any[] = (this as Layer).sketchObject.attributedString().treeAsDictionary().value.attributes;
        let results: TextFragment[] = [];
        for (let i = 0; i < fragments.length; i++) {
            let fragment = fragments[i];
            let styleBase = Object.assign({}, (this as Layer).style);
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
                            lineHeight: getDefaultLineHeightForFont(fontFamily, fontSize),
                        }
                    )
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