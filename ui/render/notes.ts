import { state } from "../common";
import { zoomSize } from "./helper";

export function notes() {
    var notesHTML = [];
    state.current.notes.forEach((note, index) => {
        notesHTML.push('<div class="note" data-index="' + (index + 1) + '" style="left: ' + zoomSize(note.rect.x) + 'px; top: ' + zoomSize(note.rect.y) + 'px;"><div style="white-space:nowrap;display:none;">' + note.note + '</div></div>');
    });
    document.querySelector('#notes').innerHTML = notesHTML.join('');
}
