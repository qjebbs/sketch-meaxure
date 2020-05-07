import { mouseoutLayer } from "./helper";
import { hideDistance } from "./distance";
import { eventDelegate } from "./delegate";

export function noteEvents() {
    let notes = document.querySelector('#notes') as HTMLElement;
    document.querySelector('#show-notes')
        .addEventListener('change', function () {
            let target = this as HTMLInputElement;
            notes.style.display = target.checked ? '' : 'none';
        })
    eventDelegate(notes, 'mousemove', '.note', function (event) {
        mouseoutLayer();
        hideDistance();
        let note = this.querySelector('div');
        note.style.display = '';
        if (note.clientWidth > 160) {
            note.style.width = '160px';
            note.style.whiteSpace = 'normal';
        }
        event.stopPropagation();
    });
    notes.addEventListener('mouseout', function (event) {
        notes.querySelectorAll('.note div').forEach(
            (div: HTMLElement) => div.style.display = 'none'
        );
    });
}