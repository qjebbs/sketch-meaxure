export enum Edge {
    vtop = 0b011111,
    vbottom = 0b101111,
    vmiddle = 0b110111,
    hleft = 0b111011,
    hright = 0b111101,
    hcenter = 0b111110,
}
export function alignElement(scroller: HTMLElement, target: HTMLElement, frameTo: DOMRect, from: Edge, to: Edge): void {
    let frameFrom = target.getBoundingClientRect();
    from = ~from;
    to = ~to;
    let fromHasV = !!(0b111000 & from);
    let toHasV = !!(0b111000 & to);
    let fromHasH = !!(0b000111 & from);
    let toHasH = !!(0b000111 & to);
    let offsetX = 0;
    let offsetY = 0;
    if (fromHasH && toHasH) {
        offsetX = frameTo.x - frameFrom.x; // left-to-left offset
        if (from & Edge.hcenter) offsetX -= frameFrom.width / 2;
        if (from & Edge.hright) offsetX -= frameFrom.width;
        if (to & Edge.hcenter) offsetX += frameTo.width / 2;
        if (to & Edge.hright) offsetX += frameTo.width;
    }
    if (fromHasV && toHasV) {
        offsetY = frameTo.y - frameFrom.y; // top-to-top offset
        if (from & Edge.vmiddle) offsetY -= frameFrom.height / 2;
        if (from & Edge.vbottom) offsetY -= frameFrom.height;
        if (to & Edge.vmiddle) offsetY += frameTo.height / 2;
        if (to & Edge.vbottom) offsetY += frameTo.height;
    }
    scroller.scrollTop -= offsetY;
    scroller.scrollLeft -= offsetX;
}
