import { eventDelegate } from "./delegate";

export function tabEvents() {
    let tab = document.querySelector('.header-left .tab') as HTMLDivElement;
    let navbar = document.querySelector('.navbar') as HTMLDivElement;
    eventDelegate(tab, 'click', 'li', function (event) {
        let current = tab.querySelector('.current');
        if (this === current) {
            this.classList.remove('current');
            navbar.classList.remove('on');
            return;
        }
        current?.classList.remove('current');
        let id = this.dataset.id;
        this.classList.add('current');
        navbar.classList.add('on');
        navbar.querySelectorAll('section').forEach(
            (sec: HTMLDivElement) => sec.style.display = 'none'
        );
        (navbar.querySelector('#' + id) as HTMLDivElement).style.display = '';
    });
}