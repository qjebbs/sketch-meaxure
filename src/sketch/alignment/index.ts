export enum LayerAlignment {
    left = 'left',
    right = 'right',
    center = 'center'
}
export enum LayerVerticalAlignment {
    top = 'top',
    bottom = 'bottom',
    middle = 'middle'
}

export function alignLayers(
    from: Layer,
    to: Layer,
    horizontal: { from: LayerAlignment, to: LayerAlignment } | boolean,
    vertical: { from: LayerVerticalAlignment, to: LayerVerticalAlignment } | boolean
): void {
    // TODO: align rotated layers
    let hAligh: { from: LayerAlignment, to: LayerAlignment };
    let vAligh: { from: LayerVerticalAlignment, to: LayerVerticalAlignment };
    if (horizontal) hAligh = Object.assign({ from: LayerAlignment.left, to: LayerAlignment.left }, horizontal)
    if (vertical) vAligh = Object.assign({ from: LayerVerticalAlignment.top, to: LayerVerticalAlignment.top }, vertical)
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
    if (hAligh) {
        // left-to-left offset
        offsetX = frameTo.x - frameFrom.x;
        if (hAligh.from == LayerAlignment.center) offsetX -= frameFrom.width / 2;
        if (hAligh.from == LayerAlignment.right) offsetX -= frameFrom.width;
        if (hAligh.to == LayerAlignment.center) offsetX += frameTo.width / 2;
        if (hAligh.to == LayerAlignment.right) offsetX += frameTo.width;
    }
    if (vertical) {
        // top-to-top offset
        offsetY = frameTo.y - frameFrom.y;
        if (vAligh.from == LayerVerticalAlignment.middle) offsetY -= frameFrom.height / 2;
        if (vAligh.from == LayerVerticalAlignment.bottom) offsetY -= frameFrom.height;
        if (vAligh.to == LayerVerticalAlignment.middle) offsetY += frameTo.height / 2;
        if (vAligh.to == LayerVerticalAlignment.bottom) offsetY += frameTo.height;
    }
    from.frame.offset(offsetX, offsetY);
}

export function alignLayersByPosition(
    from: Layer,
    to: Layer,
    position: LayerAlignment | LayerVerticalAlignment,
): void {
    switch (position) {
        case LayerAlignment.center:
        case LayerVerticalAlignment.middle:
            from.alignTo(
                to,
                { from: LayerAlignment.center, to: LayerAlignment.center },
                { from: LayerVerticalAlignment.middle, to: LayerVerticalAlignment.middle },
            )
            break;
        case LayerAlignment.left:
            from.alignTo(
                to,
                { from: LayerAlignment.right, to: LayerAlignment.left },
                { from: LayerVerticalAlignment.middle, to: LayerVerticalAlignment.middle },
            )
            break;
        case LayerAlignment.right:
            from.alignTo(
                to,
                { from: LayerAlignment.left, to: LayerAlignment.right },
                { from: LayerVerticalAlignment.middle, to: LayerVerticalAlignment.middle },
            )
            break;
        case LayerVerticalAlignment.top:
            from.alignTo(
                to,
                { from: LayerAlignment.center, to: LayerAlignment.center },
                { from: LayerVerticalAlignment.bottom, to: LayerVerticalAlignment.top },
            )
            break;
        case LayerVerticalAlignment.bottom:
            from.alignTo(
                to,
                { from: LayerAlignment.center, to: LayerAlignment.center },
                { from: LayerVerticalAlignment.top, to: LayerVerticalAlignment.bottom },
            )
            break;
        default:
            break;
    }
}