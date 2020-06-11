// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { context } from "./common/context";
import { sketch } from "../sketch";

export function clearAllMarks() {
    let targets = context.selection.length ? context.selection.layers : [context.page];
    for (let target of targets) {
        for (let layer of target.getAllChildren()) {
            if (layer.type == sketch.Types.Group && layer.name.startsWith('#meaxure-')) {
                layer.remove();
            }
        }
    }
}

export function toggleHidden() {
    let isHidden = true;
    let marks = sketch.find<Group>('Group, [name^="#meaxure-"]', context.page);
    for (let mark of marks) {
        // if one mark of all is visible, 
        // the curent state is visible, hide them all first
        if (!isHidden) break;
        isHidden = mark.hidden;
    }
    // invert the state
    isHidden = !isHidden;
    for (let mark of marks) {
        mark.hidden = isHidden;
    }
}
export function toggleLocked() {
    let isLocked = true;
    let marks = sketch.find<Group>('Group, [name^="#meaxure-"]', context.page);
    for (let mark of marks) {
        // if one mark of all is unlocked, 
        // the curent state is unlocked, lock them all first
        if (!isLocked) break;
        isLocked = mark.locked;
    }
    // invert the state
    isLocked = !isLocked;
    for (let mark of marks) {
        mark.locked = isLocked;
    }
}
function customFindRange(layers: Layer[], includingSelf: boolean): any {
    return {
        type: sketch.Types.Group,
        _isWrappedObject: true,
        sketchObject: {
            childrenIncludingSelf: function () {
                return layers.reduce((prev, layer) => {
                    prev.addObjectsFromArray(layer.sketchObject.childrenIncludingSelf(includingSelf))
                    return prev
                }, NSMutableArray.new())
            }
        }
    }
}
