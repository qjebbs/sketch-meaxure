declare const MSSharedStyleContainer;
declare const MSSharedTextStyleContainer;
declare const MSLayerGroup: {
    "new": (() => any);
}
declare const MSTextLayer: {
    "new": (() => any);
}

declare namespace MSShapeGroup {
    function shapeWithRect(rect);
}
declare class MSStyleShadow {
}
declare class MSRectangleShape {
}
declare class MSArtboardGroup {
}
declare class MSExportRequest {
    static exportRequestsFromExportableLayer(layer: any)
}
declare class MSSymbolInstance {
}
declare class MSSliceLayer {
}
declare class MSOvalShape { }
declare class MSShapePathLayer { }
declare class MSTriangleShape { }
declare class MSStarShape { }
declare class MSPolygonShape { }
declare class MSBitmapLayer { }
declare class MSSymbolMaster { }
declare class SketchSVGExporter {
    static new()
}
declare class MSColor {
    static colorWithRed_green_blue_alpha(r,g,b,a)
}