import { Rect } from "./interfaces";
import { TextAligns, FillTypes, GradientTypes, BorderPositions, emojiRegExp } from "../state/common";

export class Layer {
    private _layer: any;
    constructor(layer: any) {
        this._layer = layer;
    }
    get sketchObject() {
        return this._layer;
    }
    is(type: MSLayerClass): boolean {
        return this._layer.class() === type;
    }
    get ID() {
        return String(this._layer.objectID())
    }
    get name() {
        return String(this._layer.name())
    }
    set name(e) {
        this._layer.setName(e)
    }
    get frame() {
        return this.getRect("frame")
    }
    set frame(rect: Rect) {
        this.setRect("frame", rect)
    }
    get position() {
        return {
            x: this.rect.x - this.current.rect.x,
            y: this.rect.y - this.current.rect.y
        }
    }
    get influencePosition() {
        return {
            x: this.influenceRect.x - this.current.rect.x,
            y: this.influenceRect.y - this.current.rect.y
        }
    }
    get rect() {
        return this.getRect("absoluteRect")
    }
    set rect(rect: Rect) {
        this.setRect("absoluteRect", rect)
    }
    get influenceRect() {
        return {
            x: Number(this._layer.absoluteInfluenceRect().origin.x),
            y: Number(this._layer.absoluteInfluenceRect().origin.y),
            width: Number(this._layer.absoluteInfluenceRect().size.width),
            height: Number(this._layer.absoluteInfluenceRect().size.height)
        }
    }
    get isPage() {
        return this.is(MSPage)
    }
    get isArtboard() {
        return this.is(MSArtboardGroup)
    }
    get isGroup() {
        return this.is(MSLayerGroup)
    }
    get isText() {
        return this.is(MSTextLayer)
    }
    get isShape() {
        return this.is(MSShapeGroup) || this.is(MSRectangleShape) || this.is(MSOvalShape) || this.is(MSShapePathLayer) || this.is(MSTriangleShape) || this.is(MSStarShape) || this.is(MSPolygonShape)
    }
    get isImage() {
        return this.is(MSBitmapLayer)
    }
    get isSlice() {
        return this.is(MSSliceLayer)
    }
    get isSymbol() {
        return this.is(MSSymbolInstance)
    }
    get isSymbolMaster() {
        return this.is(MSSymbolMaster)
    }
    get type() {
        return this.isPage ? "page" :
            this.isArtboard ? "artboard" :
                this.isGroup ? "group" :
                    this.isText ? "text" :
                        this.isShape ? "shape" :
                            this.isSlice ? "slice" :
                                this.isSymbol ? "symbol" :
                                    this.isSymbolMaster ? "symbolMaster" :
                                        this.isImage ? "image" :
                                            void 0
    }
    get current() {
        if (this._layer.parentGroup) {
            let layer: Layer = this;
            while (layer) {
                layer = layer.container;
                if (layer.isPage || layer.isArtboard) {
                    return layer;
                }
            }
            // for (let t = new Layer(this._layer); t;) {
            //     if (t.container.isPage || t.container.isArtboard)
            //         return t.container;
            //     t = t.container
            // }
        }
    }
    get container() {
        if (this._layer.parentGroup) return new Layer(this._layer.parentGroup())
    }
    get text() {
        return this._layer.stringValue ? this._layer.stringValue() : void 0
    }
    set text(e) {
        this._layer.stringValue && this._layer.setStringValue(e)
    }
    get font() {
        return this._layer.fontPostscriptName ? this._layer.fontPostscriptName() : void 0
    }
    set font(e) {
        this._layer.fontPostscriptName && this._layer.setFontPostscriptName(e)
    }
    get fontSize() {
        return this._layer.fontSize ? this._layer.fontSize() : void 0
    }
    set fontSize(e) {
        this._layer.fontSize && this._layer.setFontSize(e)
    }
    get radius() {
        if (!this.isShape || !this._layer.layers) return;
        if (!new Layer(this._layer.layers().firstObject()).is(MSRectangleShape)) return 0;
        return this._layer.layers().firstObject().fixedRadius();
    }
    set radius(val: number) {
        this.isShape && this._layer.layers().firstObject().setCornerRadiusFromComponents(val.toString())
    }
    get opacity() {
        if (this._layer.style) return this._layer.style().contextSettings().opacity()
    }
    set opacity(e) {
        this._layer.style && this._layer.style().contextSettings().setOpacity(e)
    }
    get ignoreMask() {
        return this._layer.shouldBreakMaskChain()
    }
    get hasMask() {
        return this._layer.hasClippingMask()
    }
    get style() {
        if (this._layer.style) {
            let e = this._getJSONData(this._layer.style());
            return this._optimizeProperties(e), e.opacity = this.opacity, this.radius && (e.radius = this.radius), e
        }
    }
    get exportOptions() {
        return this._getJSONData(this._layer.exportOptions())
    }
    get textStyle() {
        if (this.isText) return {
            content: this._emojiToEntities(this._layer.stringValue()),
            color: this._getJSONData(this._layer.textColor()),
            fontSize: this._layer.fontSize(),
            fontFace: String(this._layer.fontPostscriptName()),
            textAlign: TextAligns[this._layer.textAlignment()],
            letterSpacing: Number(this._layer.characterSpacing()) || 0,
            lineHeight: this._layer.lineHeight() || this._layer.font().defaultLineHeightForFont()
        }
    }
    get jsonData() {
        if (this.current && (this.current.isArtboard || this.current.isPage)) {
            let data: any = {
                ID: this.ID,
                containerID: this.container.ID,
                name: this.name,
                type: this.type,
                frame: {
                    x: this.position.x,
                    y: this.position.y,
                    width: this.rect.width,
                    height: this.rect.height
                },
                influenceFrame: {
                    x: this.influencePosition.x,
                    y: this.influencePosition.y,
                    width: this.influenceRect.width,
                    height: this.influenceRect.height
                },
                exportOptions: this.exportOptions,
                ignoreMask: this.ignoreMask,
                hasMask: this.hasMask
            };
            if (this.style) data.style = this.style;
            return data;
        }
    }
    getRect(name: "frame" | "absoluteRect"): Rect {
        let rect = this._layer[name]();
        return {
            x: Number(rect.x()),
            y: Number(rect.y()),
            width: Number(rect.width()),
            height: Number(rect.height())
        }
    }
    setRect(name: "frame" | "absoluteRect", rect: Rect) {
        let layerRect = this._layer[name]();
        if (rect.x && /\d+/.test(rect.x.toString())) layerRect.setX(rect.x);
        if (rect.y && /\d+/.test(rect.y.toString())) layerRect.setY(rect.y);
        if (rect.width && /\d+/.test(rect.width.toString())) layerRect.setWidth(rect.width);
        if (rect.height && /\d+/.test(rect.height.toString())) layerRect.setHeight(rect.height);
    }
    remove() {
        let parent = this._layer.parentGroup();
        if (parent) parent.removeLayer(this._layer);
    }
    adjustToFit() {
        if (this._layer.adjustFrameToFit) this._layer.adjustFrameToFit();
        if (this._layer.resizeToFitChildrenWithOption) this._layer.resizeToFitChildrenWithOption(0);
        if (this._layer.fixGeometryWithOptions) this._layer.fixGeometryWithOptions(0);
    }
    newLayer(type: MSLayerClass, data: any) {
        if (this._layer.addLayers) {
            let shape;
            if (type == MSShapeGroup) {
                shape = MSShapeGroup.shapeWithRect(NSMakeRect(0, 0, 100, 100))
            } else {
                if (type == MSTextLayer) {
                    shape = MSTextLayer.new();
                    if (!data.text) shape.setStringValue("Type something")
                    shape.adjustFrameToFit();
                } else {
                    shape = type.alloc().initWithFrame(CGRectMake(0, 0, 100, 100))
                }
            };
            this._layer.addLayers([shape]);
            let layer = new Layer(shape);
            for (let field in data) layer[field] = data[field];
            return layer
        }
    }
    select() {
        this._layer.select_byExpandingSelection(true, false);
    }
    deselect() {
        this._layer.select_byExpandingSelection(false, true);
    }
    moveToFront() {
        MSLayerMovement.moveToFront([this._layer])
    }
    newShape(data: any) {
        return this.newLayer(MSShapeGroup, data)
    }
    newText(data: any) {
        return this.newLayer(MSTextLayer, data)
    }
    newGroup(data: any) {
        return this.newLayer(MSLayerGroup, data)
    }
    newArtboard(data: any) {
        return this.newLayer(MSArtboardGroup, data)
    }
    newImage(data: any) {
        return this.newLayer(MSBitmapLayer, data)
    }
    newSlice(data: any) {
        return this.newLayer(MSSliceLayer, data)
    }
    _typeName(e) {
        /\d+/.test(e.fillType) && (e.fillType = FillTypes[e.fillType]), /\d+/.test(e.gradientType) && (e.gradientType = GradientTypes[e.gradientType]), "border" == e._class && /\d+/.test(e.position) && (e.position = BorderPositions[e.position])
    }
    _getJSONData(obj: any) {
        obj = obj.immutableModelObject();
        let t = MSJSONDataArchiver.archiveStringWithRootObject_error(obj, nil);
        return JSON.parse(t);
    }
    _emojiToEntities(val) {
        return val.replace(emojiRegExp, function (e) {
            let t = "";
            for (let i = 0; i < e.length; i++) {
                if ((i % 2) !== 0) t += "&#" + e.codePointAt(i);
            }
            return t;
        })
    }
    _optimizeProperties(obj) {
        let t = this;
        Object.keys(obj).map(function (i) {
            if (obj[i] instanceof Object && (t._optimizeProperties(obj[i]), t._typeName(obj[i])), obj[i] instanceof Array)
                for (let n = 0; n < obj[i].length; n++) t._optimizeProperties(obj[i][n]), 1 != obj[i][n].fillType || obj[i][n].gradient || (obj[i][n].gradient = {
                    elipseLength: 0,
                    from: "{0.5, 0}",
                    gradientType: 0,
                    shouldSmoothenOpacity: 0,
                    stops: [{
                        color: {
                            alpha: 1,
                            blue: 1,
                            green: 1,
                            red: 1
                        },
                        position: 0
                    }, {
                        color: {
                            alpha: 1,
                            blue: 0,
                            green: 0,
                            red: 0
                        },
                        position: 1
                    }],
                    to: "{0.5, 1}"
                }), obj[i][n].image && delete obj[i][n].image, t._typeName(obj[i][n]);
            "textStyle" == i && (obj[i] = t.textStyle)
        })
    }
}