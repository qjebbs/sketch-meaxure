import { SelectCondition } from "./bools";
import { SelectScope, getLayersForScope } from "./scope";
import { context, sketch } from "../context";

export function selectLayers(condition: SelectCondition, scope: SelectScope) {
    let page = getPageFromScope(scope);
    if (!page) return;
    let document = page.parent;
    document.selectedLayers.layers = getLayersByCondition(condition, scope);
}

export function getLayersByCondition(condition: SelectCondition, scope: SelectScope) {
    let page = getPageFromScope(scope);
    if (!page) return;
    return getLayersForScope(scope, page)
        .filter(layer => condition.test(layer));
}

function getPageFromScope(scope: SelectScope): Page {
    if (!scope || (scope as Layer[]).length) return undefined;
    let page: Page;
    if (scope instanceof sketch.Page) {
        page = scope;
    } else if (typeof scope !== 'string') {
        let layer = (scope instanceof Array) ? scope[0] : scope;
        page = layer.getParentPage();
    } else {
        page = context.page;
    }
    return page;
}