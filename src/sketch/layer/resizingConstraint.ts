export enum ResizingConstraint {
    top = 0b011111,
    left = 0b111011,
    right = 0b111110,
    bottom = 0b110111,
    height = 0b101111,
    width = 0b111101,
}

export function setResizingConstraint(layer: Layer, constraint: number) {
    layer.sketchObject.setResizingConstraint(constraint);
}
export function getResizingConstraint(layer: Layer): number {
    return Number(layer.sketchObject.resizingConstraint());
}