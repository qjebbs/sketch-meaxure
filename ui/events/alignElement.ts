export enum Edge {
    vtop = 0b100000,
    vbottom = 0b010000,
    vmiddle = 0b001000,
    hleft = 0b000100,
    hright = 0b000010,
    hcenter = 0b000001,
}

export function alignElement(options: {
    scroller: HTMLElement,
    target: HTMLElement,
    fromRect?: DOMRect,
    toRect: DOMRect,
    fromEdge: Edge,
    toEdge: Edge,
}): void {
    let fromRect = options.fromRect || options.target.getBoundingClientRect();
    let from = options.fromEdge;
    let to = options.toEdge;
    let fromHasV = !!(0b111000 & from);
    let toHasV = !!(0b111000 & to);
    let fromHasH = !!(0b000111 & from);
    let toHasH = !!(0b000111 & to);
    let offsetX = 0;
    let offsetY = 0;
    if (fromHasH && toHasH) {
        offsetX = options.toRect.x - fromRect.x; // left-to-left offset
        if (from & Edge.hcenter) offsetX -= fromRect.width / 2;
        if (from & Edge.hright) offsetX -= fromRect.width;
        if (to & Edge.hcenter) offsetX += options.toRect.width / 2;
        if (to & Edge.hright) offsetX += options.toRect.width;
    }
    if (fromHasV && toHasV) {
        offsetY = options.toRect.y - fromRect.y; // top-to-top offset
        if (from & Edge.vmiddle) offsetY -= fromRect.height / 2;
        if (from & Edge.vbottom) offsetY -= fromRect.height;
        if (to & Edge.vmiddle) offsetY += options.toRect.height / 2;
        if (to & Edge.vbottom) offsetY += options.toRect.height;
    }
    options.scroller.scrollTop -= offsetY;
    options.scroller.scrollLeft -= offsetX;
}
