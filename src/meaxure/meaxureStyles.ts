// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from "../sketch";
import { context } from "./common/context";

let overrides: {
    [key: string]: { foreground: any, background: any }
} = {
    coordinate: {
        background: { fills: [makeFill('#4A8FE3FF')] },
        foreground: { textColor: '#FFFFFFFF' },
    },
    overlay: {
        background: { fills: [makeFill('#FF55004C')] },
        foreground: { textColor: '#FFFFFFFF' },
    },
    spacing: {
        background: { fills: [makeFill('#50E3C2FF')] },
        foreground: { textColor: '#FFFFFFFF' },
    },
    size: {
        background: { fills: [makeFill('#FF5500FF')] },
        foreground: { textColor: '#FFFFFFFF' },
    },
    property: {
        background: { fills: [makeFill('#F5A623FF')] },
        foreground: {
            textColor: '#FFFFFFFF',
            alignment: sketch.Text.Alignment.left,
            verticalAlignment: sketch.Text.VerticalAlignment.top,
            lineHeight: null,
        },
    },
    note: {
        background: { fills: [makeFill('#FFFCDCFF')], borders: [makeBorder('#CCCCCCFF')] },
        foreground: {
            textColor: '#555555FF',
            alignment: sketch.Text.Alignment.left,
            verticalAlignment: sketch.Text.VerticalAlignment.top,
            lineHeight: null,
        },
    },
}

interface MeaxureStyle {
    background: SharedStyle,
    foreground: SharedStyle,
}

export class MeaxureStyles {
    private _document: Document;
    constructor(document: Document) {
        this._document = document;
    }
    get coordinate(): MeaxureStyle {
        return getMeaxureStyle(this._document, 'Sketch MeaXure / Coordinate', 'coordinate');
    }
    get overlay(): MeaxureStyle {
        return getMeaxureStyle(this._document, 'Sketch MeaXure / Overlay', 'overlay');
    }
    get spacing(): MeaxureStyle {
        return getMeaxureStyle(this._document, 'Sketch MeaXure / Spacing', 'spacing');
    }
    get size(): MeaxureStyle {
        return getMeaxureStyle(this._document, 'Sketch MeaXure / Size', 'size');
    }
    get property(): MeaxureStyle {
        return getMeaxureStyle(this._document, 'Sketch MeaXure / Property', 'property');
    }
    get note(): MeaxureStyle {
        return getMeaxureStyle(this._document, 'Sketch MeaXure / Note', 'note');
    }
}

function getMeaxureStyle(document: Document, name: string, overrideName: string): MeaxureStyle {
    let override = overrides[overrideName]
    let background = findSharedLayerStyle(document, name);
    if (!background) background = maskSharedStyle(document, name, override.background, 'layer');
    let foreground = findSharedTextStyle(document, name);
    if (!foreground) foreground = maskSharedStyle(document, name, override.foreground, 'text');
    return {
        background: background,
        foreground: foreground,
    }
}

function findSharedTextStyle(document: Document, name): SharedStyle {
    let sharedStyles = document.sharedTextStyles;
    return sharedStyles.find(s => s.name == name);
}
function findSharedLayerStyle(document: Document, name): SharedStyle {
    let sharedStyles = document.sharedLayerStyles;
    return sharedStyles.find(s => s.name == name);
}

function makeFill(color: string): Fill {
    return <Fill>{
        enabled: true,
        fillType: sketch.Style.FillType.Color,
        color: color,
    }
}

function makeBorder(color: string): Border {
    return <Border>{
        enabled: true,
        fillType: sketch.Style.FillType.Color,
        color: color,
        thickness: 1,
        position: sketch.Style.BorderPosition.Inside,
    }
}

function maskSharedStyle(document: Document, name: string, override: any, type: 'text' | 'layer'): SharedStyle {
    let base: Style = type == 'layer' ? makeBaseLayerStyle() : makeBaseTextStyle();
    let style = Object.assign<Style, any>(base, override);
    let sharedStyle = sketch.SharedStyle.fromStyle({ name: name, document: document, style: style });
    return sharedStyle
}

function makeBaseLayerStyle(): Style {
    let baseStyle = new sketch.Style();
    baseStyle.fills = [makeFill('#FFFCDCFF')];
    baseStyle.borders = [];
    baseStyle.opacity = 1;
    baseStyle.blur = null;
    baseStyle.shadows = [];
    baseStyle.innerShadows = [];
    return baseStyle;
}

function makeBaseTextStyle(): Style {
    let baseStyle = new sketch.Style();
    baseStyle.fills = [];
    baseStyle.borders = [];
    baseStyle.alignment = sketch.Text.Alignment.center;
    baseStyle.verticalAlignment = sketch.Text.VerticalAlignment.center;
    baseStyle.fontSize = 12;
    baseStyle.lineHeight = 12;
    baseStyle.paragraphSpacing = null;
    baseStyle.fontFamily = 'Helvetica Neue';
    baseStyle.fontStyle = null;
    baseStyle.fontStretch = null;
    baseStyle.fontWeight = 5;
    baseStyle.kerning = 0;
    baseStyle.textUnderline = null;
    baseStyle.textStrikethrough = null;
    baseStyle.textColor = '#FFFFFFFF';
    baseStyle.opacity = 1;
    baseStyle.blur = null;
    baseStyle.shadows = [];
    baseStyle.innerShadows = [];
    baseStyle.textTransform = 'none';
    
    return baseStyle;
}
