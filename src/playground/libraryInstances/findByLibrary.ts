import { sketch } from "../context";

export function findLayersWithStyleFrom(document: Document, library: string): Layer[] {
    let lib: Library;
    let instnaces: Layer[] = [];
    let styles = document.sharedLayerStyles
        .concat(document.sharedTextStyles)
        .filter(s => (lib = s.getLibrary()) && lib.name == library);
    for (let style of styles) {
        instnaces.push(...style.getAllInstancesLayers());
        if (instnaces.length) {
            console.log(style.name + ": " + instnaces.length);
            return instnaces;
        }
    }
    return [];
}
export function findSymbolsWithStyleFrom(document: Document, library: string): Layer[] {
    for (let page of document.pages) {
        let symbols = sketch.find<SymbolInstance>('SymbolInstance', page)
            .filter(s => s.overrides.reduce((p, c) => {
                if (p) return true;
                let id = c.value as string;
                if (!id) return false;
                let style = document.getSharedLayerStyleWithID(id) ||
                    document.getSharedTextStyleWithID(id);
                if (!style) return false;
                let lib = style.getLibrary();
                if (!lib) return false;
                let isLib = lib.name == library;
                if (isLib) console.log(c.affectedLayer.name);
                return isLib;
            }, false))
        if (symbols.length) {
            console.log("SymbolInstances: " + symbols.length);
            return symbols;
        }
    }
    return [];
}
export function findSymbolInstacesFrom(document: Document, library: string): SymbolInstance[] {
    let lib: Library;
    let instnaces: SymbolInstance[] = [];
    let symbols = document.getSymbols()
        .filter(s => (lib = s.getLibrary()) && lib.name == library);
    for (let symbol of symbols) {
        instnaces.push(...symbol.getAllInstances());
        if (instnaces.length) {
            console.log(symbol.name + ": " + instnaces.length);
            return instnaces;
        }
    }
    return [];
}