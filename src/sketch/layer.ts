import { sketch } from ".";

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface Layer {
            frameInfluence: Rectangle;
            shouldBreakMaskChain: boolean;
            hasClippingMask: boolean;
            CSSAttributes: string[];
            allSubLayers(): Layer[];
            /**
             * get sibling layer
             * @param offset offset to this Layer, e.g.: 1 for next layer, -1 for previous
             * @returns the sibling layer or undefined if offsets to non-existed index
             */
            sibling(offset: number): Layer;
        }
    }
}

export function extendLayer() {
    let target = sketch.Layer.prototype
    Object.defineProperty(target, "frameInfluence", {
        get: function () {
            // TODO: frameInfluence should base on its parent
            let artboardRect = (this as Layer).getParentArtboard().sketchObject.absoluteRect().rect();
            let influenceCGRect = this.sketchObject.absoluteInfluenceRect();
            return new sketch.Rectangle(
                influenceCGRect.origin.x - artboardRect.origin.x,
                influenceCGRect.origin.y - artboardRect.origin.y,
                influenceCGRect.size.width,
                influenceCGRect.size.height,
            );
        }
    });
    Object.defineProperty(target, "shouldBreakMaskChain", {
        get: function (): boolean {
            return !!this.sketchObject.shouldBreakMaskChain();
        }
    });
    Object.defineProperty(target, "hasClippingMask", {
        get: function (): boolean {
            return !!this.sketchObject.hasClippingMask();
        }
    });
    Object.defineProperty(target, "CSSAttributes", {
        get: function () {
            let layerCSSAttributes = this.sketchObject.CSSAttributes();
            let css = [];
            for (let i = 0; i < layerCSSAttributes.count(); i++) {
                let attribute = new String(layerCSSAttributes[i]).toString();
                css.push(attribute);
            }
            return css;
        }
    });
    target.allSubLayers = function (): Layer[] {
        let layers: Layer[] = [];
        // // fromNative Layers do not have the property 'type'
        // let layerObject: any;
        // let layerObjects = this.sketchObject.children().objectEnumerator();
        // while (layerObject = layerObjects.nextObject()) {
        //     layers.push(sketch.Layer.fromNative(layerObject))
        // }
        enumLayers(this);
        function enumLayers(layer: Layer) {
            layers.push(layer)
            if (layer.layers) {
                layer.layers.forEach(l => enumLayers(l));
            }
        }
        return layers;
    }
    target.sibling = function (offset: number): Layer {
        if (offset == 0) return this;
        let layers = (this as Layer).parent.layers;
        let index = (this as Layer).index + offset;
        if (index > layers.length - 1 || index < 0) return undefined;
        return layers[index];
    }
}
