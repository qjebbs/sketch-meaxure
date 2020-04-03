import { sketch } from "..";

export function alignLayers(
    from: Layer,
    to: Layer,
    horizontal: { from: Alignment, to: Alignment },
    vertical: { from: VerticalAlignment, to: VerticalAlignment }
): void {
    if (horizontal) horizontal = Object.assign({ from: sketch.Text.Alignment.left, to: sketch.Text.Alignment.left }, horizontal)
    if (vertical) vertical = Object.assign({ from: sketch.Text.VerticalAlignment.top, to: sketch.Text.VerticalAlignment.top }, vertical)
    if (!horizontal && !vertical) return;
    let root = from.getParentArtboard() || from.getParentPage();
    let rootTo = to.getParentArtboard() || to.getParentPage();
    if (root.id !== rootTo.id) {
        // logger.debug(`from in ${root.name} while to in ${rootTo}, skipping`);
        return;
    }
    let frameFrom = from.frame.changeBasis({ from: from.parent, to: root });
    let frameTo = to.frame.changeBasis({ from: to.parent, to: root });

    let offsetX = 0;
    let offsetY = 0;
    if (horizontal) {
        // left-to-left offset
        offsetX = frameTo.x - frameFrom.x;
        if (horizontal.from == sketch.Text.Alignment.center) offsetX -= frameFrom.width / 2;
        if (horizontal.from == sketch.Text.Alignment.right) offsetX -= frameFrom.width;
        if (horizontal.to == sketch.Text.Alignment.center) offsetX += frameTo.width / 2;
        if (horizontal.to == sketch.Text.Alignment.right) offsetX += frameTo.width;
    }
    if (vertical) {
        // top-to-top offset
        offsetY = frameTo.y - frameFrom.y;
        if (vertical.from == sketch.Text.VerticalAlignment.center) offsetY -= frameFrom.height / 2;
        if (vertical.from == sketch.Text.VerticalAlignment.bottom) offsetY -= frameFrom.height;
        if (vertical.to == sketch.Text.VerticalAlignment.center) offsetY += frameTo.height / 2;
        if (vertical.to == sketch.Text.VerticalAlignment.bottom) offsetY += frameTo.height;
    }
    from.frame.offset(offsetX, offsetY);
}