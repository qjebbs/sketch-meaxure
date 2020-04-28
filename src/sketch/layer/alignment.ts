// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from "..";

export enum Edge {
    left = 'left',
    right = 'right',
    center = 'center'
}
export enum EdgeVertical {
    top = 'top',
    bottom = 'bottom',
    middle = 'middle'
}

export function alignLayers(
    from: Layer,
    to: Layer | Rectangle,
    horizontal: { from: Edge, to: Edge } | boolean,
    vertical: { from: EdgeVertical, to: EdgeVertical } | boolean
): void {
    // TODO: align rotated layers
    if (!horizontal && !vertical) return;
    let hAligh: { from: Edge, to: Edge };
    let vAligh: { from: EdgeVertical, to: EdgeVertical };
    if (horizontal) hAligh = Object.assign({ from: Edge.left, to: Edge.left }, horizontal)
    if (vertical) vAligh = Object.assign({ from: EdgeVertical.top, to: EdgeVertical.top }, vertical)
    let root = from.getParentArtboard() || from.getParentPage();
    if (to instanceof sketch.Layer) {
        let rootTo = to.getParentArtboard() || to.getParentPage();
        if (root.id !== rootTo.id) {
            // logger.debug(`from in ${root.name} while to in ${rootTo}, skipping`);
            return;
        }
    }
    let frameFrom = from.frame.changeBasis({ from: from.parent as Group, to: root });
    let frameTo = (to instanceof sketch.Layer) ? to.frame.changeBasis({ from: to.parent as Group, to: root }) : to;

    let offsetX = 0;
    let offsetY = 0;
    if (hAligh) {
        // left-to-left offset
        offsetX = frameTo.x - frameFrom.x;
        if (hAligh.from == Edge.center) offsetX -= frameFrom.width / 2;
        if (hAligh.from == Edge.right) offsetX -= frameFrom.width;
        if (hAligh.to == Edge.center) offsetX += frameTo.width / 2;
        if (hAligh.to == Edge.right) offsetX += frameTo.width;
    }
    if (vertical) {
        // top-to-top offset
        offsetY = frameTo.y - frameFrom.y;
        if (vAligh.from == EdgeVertical.middle) offsetY -= frameFrom.height / 2;
        if (vAligh.from == EdgeVertical.bottom) offsetY -= frameFrom.height;
        if (vAligh.to == EdgeVertical.middle) offsetY += frameTo.height / 2;
        if (vAligh.to == EdgeVertical.bottom) offsetY += frameTo.height;
    }
    from.frame.offset(offsetX, offsetY);
}

export function alignLayersByPosition(
    from: Layer,
    to: Layer | Rectangle,
    position: Edge | EdgeVertical,
): void {
    switch (position) {
        case Edge.center:
        case EdgeVertical.middle:
            from.alignTo(
                to,
                { from: Edge.center, to: Edge.center },
                { from: EdgeVertical.middle, to: EdgeVertical.middle },
            )
            break;
        case Edge.left:
            from.alignTo(
                to,
                { from: Edge.right, to: Edge.left },
                { from: EdgeVertical.middle, to: EdgeVertical.middle },
            )
            break;
        case Edge.right:
            from.alignTo(
                to,
                { from: Edge.left, to: Edge.right },
                { from: EdgeVertical.middle, to: EdgeVertical.middle },
            )
            break;
        case EdgeVertical.top:
            from.alignTo(
                to,
                { from: Edge.center, to: Edge.center },
                { from: EdgeVertical.bottom, to: EdgeVertical.top },
            )
            break;
        case EdgeVertical.bottom:
            from.alignTo(
                to,
                { from: Edge.center, to: Edge.center },
                { from: EdgeVertical.top, to: EdgeVertical.bottom },
            )
            break;
        default:
            break;
    }
}