import { getEventTargetFromSelector } from "./helper";

export function tabEvents() {
    let tab = document.querySelector('.header-left .tab') as HTMLDivElement;
    let navbar = document.querySelector('.navbar') as HTMLDivElement;
    tab.addEventListener('click', event => {
        let target = getEventTargetFromSelector(event, 'li');
        let current = tab.querySelector('.current');
        if (!target) return;
        if (target === current) {
            target.classList.remove('current');
            navbar.classList.remove('on');
            return;
        }
        current?.classList.remove('current');
        let id = target.dataset.id;
        target.classList.add('current');
        navbar.classList.add('on');
        navbar.querySelectorAll('section').forEach(
            (sec: HTMLDivElement) => sec.style.display = 'none'
        );
        (navbar.querySelector('#' + id) as HTMLDivElement).style.display = '';
    });
}