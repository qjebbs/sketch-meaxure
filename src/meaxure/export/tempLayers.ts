class TempLayersManager {
    private _layers: Layer[] = [];
    private _idMap: { [key: string]: boolean } = {};
    constructor() { }
    removeAll() {
        for (let tmp of this._layers) {
            if (tmp) tmp.remove();
        }
        this._layers = [];
        this._idMap = {};
    }
    add(layer: Layer) {
        layer.name = '#tmp-' + layer.name;
        layer.hidden = true;
        this._layers.push(layer);
        this._idMap[layer.id] = true;
    }
    exists(layerID: string): boolean;
    exists(layer: Layer): boolean;
    exists(para: string | Layer): boolean {
        let id = (typeof para == 'string') ? para : para.id;
        return this._idMap[id];
    }
}

export let tempLayers = new TempLayersManager();
