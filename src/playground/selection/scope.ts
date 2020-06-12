import { sketch } from "../context";

export type SelectScope = Group | Artboard | Page | Layer[] | string;
export function getLayersForScope(scope: SelectScope, currentPage: Page): Layer[] {
    if (scope instanceof Array) return scope;
    if (typeof scope === 'string') {
        let layers = [];
        sketch.find<Layer>(scope, currentPage).forEach(find => layers.push(...find.getAllChildren()));
        return layers;
    }
    return scope.getAllChildren();
}