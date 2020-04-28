import { findLayersWithStyleFrom, findSymbolInstacesFrom, findSymbolsWithStyleFrom } from "./findByLibrary";

export function selectLayersByLibrary(document: Document, library: string): void {
    let instnaces = findLayersWithStyleFrom(document, library);
    if (!instnaces.length)
        instnaces = findSymbolInstacesFrom(document, library);
    if (!instnaces.length)
        instnaces = findSymbolsWithStyleFrom(document, library);
    if (!instnaces.length)
        return;
    document.selectedPage = instnaces[0].getParentPage();
    document.selectedLayers.layers = instnaces;
}
