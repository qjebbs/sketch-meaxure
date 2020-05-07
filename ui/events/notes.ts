import { getEventTargetFromSelector, mouseoutLayer } from "./helper";
import { hideDistance } from "./distance";

export function noteEvents() {
    let notes = document.querySelector('#notes') as HTMLElement;
    document.querySelector('#show-notes')
        .addEventListener('change', function () {
            let target = this as HTMLInputElement;
            notes.style.display = target.checked ? '' : 'none';
        })
    notes.addEventListener('mousemove', event => {
        let target = getEventTargetFromSelector(event, '.note');
        if (!target) return;
        mouseoutLayer();
        hideDistance();
        let note = target.querySelector('div');
        note.style.display = '';
        if (note.clientWidth > 160) {
            note.style.width = '160px';
            note.style.whiteSpace = 'normal';
        }
        event.stopPropagation();
    });
    notes.addEventListener('mouseout', event => {
        notes.querySelectorAll('.note div').forEach(
            (div: HTMLElement) => div.style.display = 'none'
        );
    });
}