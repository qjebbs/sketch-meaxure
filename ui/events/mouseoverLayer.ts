import { configs } from "../configs";

export function mouseoverLayer() {
    if (configs.targetIndex && configs.selectedIndex == configs.targetIndex) return false;
    var target = document.querySelector('#layer-' + configs.targetIndex) as HTMLElement;
    target.classList.add('hover');
    let rv = (document.querySelector('#rv') as HTMLElement);
    rv.style.left = target.offsetLeft + 'px';
    rv.style.width = target.offsetWidth + 'px';
    let rh = (document.querySelector('#rh') as HTMLElement);
    rh.style.top = target.offsetTop + 'px';
    rh.style.height = target.offsetHeight + 'px';
    (document.querySelector('#rulers') as HTMLElement).style.display = '';
}