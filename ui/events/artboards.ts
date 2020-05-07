import { getEventTarget, getIndex } from "./helper";
import { configs } from "../configs";
import { project } from "../common";
import { layers, notes, screen, locationHash } from "../render/helper";
import { hideDistance } from "./distance";

export function artboardsEvents() {
    let artboardsList = document.querySelector('#artboards') as HTMLElement;
    artboardsList.addEventListener(
        'click', function (event) {
            let target = getEventTarget(artboardsList, event, '.artboard');
            if (!target) return;
            // console.log(target);
            let index = getIndex(target);
            if (configs.artboardIndex == index) return;
            configs.maxSize = undefined;
            configs.artboardIndex = index;
            configs.selectedIndex = undefined;
            configs.current = project.artboards[configs.artboardIndex];
            hideDistance();
            screen();
            layers();
            notes();
            document.querySelector('.active').classList.remove('active');
            target.classList.add('active');
            locationHash({
                artboard: configs.artboardIndex
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