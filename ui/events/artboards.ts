import { getIndex } from "./helper";
import { state } from "../common";
import { project } from "../common";
import { locationHash } from "../render/helper";
import { screen } from "../render/screen";
import { layers } from "../render/layers";
import { notes } from "../render/notes";
import { hideDistance } from "./distance";
import { eventDelegate } from "./delegate";

export function artboardsEvents() {
    let artboardsList = document.querySelector('#artboards') as HTMLElement;
    eventDelegate(artboardsList, 'click', '.artboard', function (event) {
        let index = getIndex(this);
        if (state.artboardIndex == index) return;
        state.maxSize = undefined;
        state.artboardIndex = index;
        state.selectedIndex = undefined;
        state.current = project.artboards[state.artboardIndex];
        hideDistance();
        screen();
        layers();
        notes();
        document.querySelector('.active').classList.remove('active');
        this.classList.add('active');
        locationHash({
            artboard: state.artboardIndex
        });
    });
    eventDelegate(artboardsList, 'change', 'input[name=page]', function (event) {
            var pObjectID = (document.querySelector('.page-list input[name=page]:checked') as HTMLInputElement).value;
            document.querySelector('.pages-select h3')
                .innerHTML = this.parentElement.querySelector('span').innerHTML;
            document.querySelectorAll('.artboard-list li').forEach((li: HTMLElement) => {
                if (pObjectID == 'all' || li.getAttribute('data-page-id') == pObjectID) {
                    li.style.display = '';
                } else {
                    li.style.display = 'none';
                }
            });
            (document.querySelector('.pages-select') as HTMLElement).blur();
            event.stopPropagation();
        }
    );
}