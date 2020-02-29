declare const MSSharedStyleContainer;
declare const MSSharedTextStyleContainer;


declare class MSLayerClass {
    new: () => any;
    alloc: () => any;
    shapeWithRect: (rect) => any;
    sliceLayerFromLayer: (layer) => any;
}
declare const MSLayerGroup: MSLayerClass;
declare const MSTextLayer: MSLayerClass;
declare const MSSliceLayer: MSLayerClass;
declare const MSShapeGroup: MSLayerClass;
declare const MSBitmapLayer: MSLayerClass;
declare const MSArtboardGroup: MSLayerClass;
declare const MSRectangleShape: MSLayerClass;
declare const MSOvalShape: MSLayerClass;
declare const MSShapePathLayer: MSLayerClass;
declare const MSTriangleShape: MSLayerClass;
declare const MSStarShape: MSLayerClass;
declare const MSPolygonShape: MSLayerClass;
declare const MSPage: MSLayerClass;
declare const MSSymbolInstance: MSLayerClass;
declare const MSSymbolMaster: MSLayerClass;

declare namespace MSLayerMovement {
    function moveToFront(layers: any[]);
}

declare class MSStyleShadow { }
declare class MSExportRequest {
    static exportRequestsFromExportableLayer(layer: any)
}
declare class MSSharedStyle {
    static alloc();
}
declare class MSStyle {
    static alloc();
}
declare class SketchSVGExporter {
    static new();
}
declare class MSColor {
    static colorWithRed_green_blue_alpha(r, g, b, a);
}
declare class MSRect {
    static rectWithUnionOfRects(...args);
    static alloc()
}

declare class MSJSONDataArchiver {
    static archiveStringWithRootObject_error(...args);
}