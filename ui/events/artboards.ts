import { getEventTarget, getIndex } from "./helper";
import { state } from "../common";
import { project } from "../common";
import { locationHash } from "../render/helper";
import { screen } from "../render/screen";
import { layers } from "../render/layers";
import { notes } from "../render/notes";
import { hideDistance } from "./distance";

export function artboardsEvents() {
    let artboardsList = document.querySelector('#artboards') as HTMLElement;
    artboardsList.addEventListener(
        'click', function (event) {
            let target = getEventTarget(artboardsList, event, '.artboard');
            if (!target) return;
            // console.log(target);
            let index = getIndex(target);
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
            target.classList.add('active');
            locationHash({
                artboard: state.artboardIndex
            });
        }
    );
    artboardsList.addEventListener(
        'change', function (event) {
            let target = getEventTarget(artboardsList, event, 'input[name=page]');
            if (!target) return;
            var pObjectID = (document.querySelector('.page-list input[name=page]:checked') as HTMLInputElement).value;
            document.querySelector('.pages-select h3')
                .innerHTML = target.parentElement.querySelector('span').innerHTML;
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