import { context, sketch } from "./context";

/**
 * linkColorsToSwatches links colors of shardStyles and layer styles to Swatches
 * if their colors are match. Swatches could come from both current document 
 * and shared libraries.
 */
export function linkColorsToSwatches(libSelector?: (lib: Library) => boolean) {
    let document = context.document;
    let swatches: Swatch[] = [];
    swatches.push(...document.swatches);
    for (let lib of sketch.getLibraries()) {
        if (libSelector && !libSelector(lib)) continue;
        for (let i of lib.getImportableSwatchReferencesForDocument(document)) {
            let sw = i.import() as Swatch;
            if (sw) {
                // console.log("import:", i.name, "=", sw.color)
                swatches.push(sw);
            }
        }
    }
    // console.log(swatches.length, "swatches fuound.");
    for (let s of document.sharedLayerStyles) {
        updateColorsOfStyle(s.style, swatches);
    }
    for (let s of document.sharedTextStyles) {
        updateColorsOfStyle(s.style, swatches);
    }
    for (let p of document.pages) {
        for (let layer of p.getAllChildren()) {
            if (layer.type == sketch.Types.Text && (layer as Text).getFragmentsCount() > 1) {
                continue;
            }
            updateColorsOfStyle(layer.style, swatches);
        }
    }
}

function updateColorsOfStyle(s: Style, swatches: Swatch[]) {
    if (!s) return;
    if (s.fills && s.fills.length) updateColorAttributes(s.fills, swatches)
    if (s.borders && s.borders.length) updateColorAttributes(s.borders, swatches)
    if (!s.textColor) return;
    let sw = swatches.find(sw => {
        return sw.color == s.textColor;
    });
    if (!sw) return;
    s.textColor = sw.referencingColor;
}

function updateColorAttributes(attrs: { color: string }[], swatches: Swatch[]) {
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        let sw = swatches.find(s => {
            return s.color == attr.color;
        });
        if (!sw) continue;
        attr.color = sw.referencingColor;
    }
}