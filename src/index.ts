// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { settingsPanel } from "./meaxure/panels/settingsPanel";
import { updateContext } from "./meaxure/common/context";
import { logger } from "./meaxure/common/logger";
import { markToolbar } from "./meaxure/panels/toolbar";
import { openURL } from "./meaxure/helpers/helper";
import { exportSpecification } from "./meaxure/export";
import { markNote } from "./meaxure/note";
import { markPropertiesAll } from "./meaxure/properties";
import { markOverlays } from "./meaxure/overlay";
import { drawCoordinate } from "./meaxure/coordinate";
import { drawSizes } from "./meaxure/size";
import { drawSpacings } from "./meaxure/spacings";
import { toggleHidden, toggleLocked, clearAllMarks } from "./meaxure/manage";
import { sketch } from "./sketch";
import { EdgeVertical, Edge } from "./sketch/layer/alignment";
import { renameOldMarkers } from "./meaxure/helpers/renameOldMarkers";

export function commandInit(context) { updateContext(context); return false; }
export function commandSettings(context?) { runAndCatch(settingsPanel, context); }
export function commandToolbar(context) { runAndCatch(markToolbar, context); }
export function commandOverlays(context?) { runAndCatch(markOverlays, context); }
export function commandSizes(context?) { commandSizeTop(context); commandSizeRight(context); }
export function commandSizeTop(context?) { runAndCatch(drawSizes, context, EdgeVertical.top); }
export function commandSizeMiddle(context?) { runAndCatch(drawSizes, context, EdgeVertical.middle); }
export function commandSizeBottom(context?) { runAndCatch(drawSizes, context, EdgeVertical.bottom); }
export function commandSizeLeft(context?) { runAndCatch(drawSizes, context, Edge.left); }
export function commandSizeCenter(context?) { runAndCatch(drawSizes, context, Edge.center); }
export function commandSizeRight(context?) { runAndCatch(drawSizes, context, Edge.right); }
export function commandSpacings(context?) { runAndCatch(drawSpacings, context); }
export function commandSpacingVertical(context?) { runAndCatch(drawSpacings, context, "vertical"); }
export function commandSpacingHorizontal(context?) { runAndCatch(drawSpacings, context, "horizontal"); }
export function commandSpacingTop(context?) { runAndCatch(drawSpacings, context, "top"); }
export function commandSpacingBottom(context?) { runAndCatch(drawSpacings, context, "bottom"); }
export function commandSpacingLeft(context?) { runAndCatch(drawSpacings, context, "left"); }
export function commandSpacingRight(context?) { runAndCatch(drawSpacings, context, "right"); }
export function commandProperties(context?) { runAndCatch(markPropertiesAll, context); }
export function commandNote(context?) { runAndCatch(markNote, context); }
export function commandCoordinate(context?) { runAndCatch(drawCoordinate, context); }
export function commandHidden(context?) { runAndCatch(toggleHidden, context); }
export function commandLocked(context?) { runAndCatch(toggleLocked, context); }
export function commandClear(context?) { runAndCatch(clearAllMarks, context); }
export function commandExport(context?) { runAndCatch(exportSpecification, context); }
export function commandRenameOldMarkers(context?) { runAndCatch(renameOldMarkers, context); }
export function linkFeedback(context?) { runAndCatch(openURL, context, "https://github.com/qjebbs/sketch-meaxure/issues"); }
export function linkHome(context?) { runAndCatch(openURL, context, "https://github.com/qjebbs/sketch-meaxure"); }

function runAndCatch(fn: Function, context, ...args) {
    try {
        updateContext(context);
        let returns = fn(...args);
        if (returns instanceof Promise) {
            returns.catch(error => showError(error))
        }
    } catch (error) {
        showError(error);
    }
    function showError(error) {
        logger.error(error);
        sketch.UI.message(error);
    }
}
