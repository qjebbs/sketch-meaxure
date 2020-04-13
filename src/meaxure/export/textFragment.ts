// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { ArtboardData } from "../interfaces"; import { sketch } from "../../sketch";
import { tempCreatedLayers } from ".";
import { getLayerData } from "./layerData";
import { TextFragment } from "../../sketch/text/textFragment";

export function getTextFragment(artboard: Artboard, layer: Text, data: ArtboardData) {
    if (layer.type != sketch.Types.Text) return;
    let fragments = layer.getFragments();
    if (fragments.length < 2) return;

    let offsetFragmentsY = 0;
    let textFrame = layer.frame;
    let heightIfSingleLine = layer.style.lineHeight || Math.max(...fragments.map(f => f.defaultLineHeight));
    let lines: TextFragment[][];
    if (textFrame.height > heightIfSingleLine) {
        // only getFragmentsByLines when multi-line
        lines = getFragmentsByLines(layer, fragments);
    } else {
        lines = [fragments];
    }
    for (let frags of lines) {
        let offsetFragmentsX = 0;
        if (frags.length == 1 && frags[0].text == '\n') {
            // if it's a fake line (a new paragraph)
            offsetFragmentsY += layer.style.paragraphSpacing;
            continue;
        }
        let currentLineHeight = layer.style.lineHeight || Math.max(...frags.map(f => f.defaultLineHeight));
        for (let fragment of frags) {
            let subText = new sketch.Text({ text: fragment.text, parent: layer.parent, hidden: true });
            tempCreatedLayers.push(subText);
            subText.style = fragment.style;
            subText.style.lineHeight = currentLineHeight;
            subText.frame.x = textFrame.x + offsetFragmentsX;
            subText.frame.y = textFrame.y + offsetFragmentsY;
            offsetFragmentsX += subText.frame.width;
            getLayerData(artboard, subText, data, false);
            subText.remove();
        }
        offsetFragmentsY += currentLineHeight;
    }
}
function getFragmentsByLines(layer: Text, fragments: TextFragment[]): TextFragment[][] {
    let svg = (
        sketch.export(layer, { output: undefined, formats: 'svg' }) as Buffer
    ).toString();
    let lines = getFragmentLinesFromSVG(svg);
    let fragmentsByLines: TextFragment[][] = [];
    let currentFragment: TextFragment = undefined;
    for (let line of lines) {
        let lineFragments = [];
        for (let element of line.elements) {
            if (!currentFragment) currentFragment = fragments.shift();
            if (currentFragment.text == '\n') {
                // currentFragment.text is \n, it creates a new line, which doesn't appear in svg.
                // so just push a fake line (presents a new paragraph), and shift fragments
                // currentFragment.text = '';
                fragmentsByLines.push([currentFragment]);
                currentFragment = fragments.shift();
            }
            if (element.length == currentFragment.text.length) {
                // push and process next fragment
                lineFragments.push(currentFragment);
                currentFragment = undefined;
            } else {
                // element is short than fragment, fragment wrapped
                let leftPart: TextFragment;
                [leftPart, currentFragment] = splitFragment(currentFragment, element);
                lineFragments.push(leftPart);
            }
        }
        fragmentsByLines.push(lineFragments);
    }
    return fragmentsByLines;
}
function splitFragment(fragment: TextFragment, splitText: string): [TextFragment, TextFragment] {
    let left = Object.assign({}, fragment);
    left.length = splitText.length
    left.text = splitText;
    fragment.text = fragment.text.substring(left.length)
    fragment.location += left.length;
    fragment.length -= left.length;
    if (fragment.length < 0) throw new Error('splitFragment: fragment splitted to negtive length');
    if (!fragment.length) fragment = undefined;
    return [left, fragment];
}

function getFragmentLinesFromSVG(svg: string) {
    const REG_TSPAN = /<tspan x="(\d+(?:\.\d+)?)".+?>(.+?)<\/tspan>/g
    let leftX = undefined;
    let lines: { elements: string[] }[] = [];
    let lineElements: string[] = [];
    let execArray: RegExpExecArray;
    while (execArray = REG_TSPAN.exec(svg)) {
        let x = parseFloat(execArray[1]);
        let text = execArray[2];
        if (leftX === undefined) {
            leftX = x;
        } else if (leftX == x) {
            // next line now
            lines.push({
                elements: lineElements,
            });
            lineElements = [text];
            continue;
        }
        // current line
        lineElements.push(text);
    }
    // push the last line
    lines.push({
        elements: lineElements,
    });
    return lines;
}