import { clickElement } from "../helper";

export function keyboardSwitchEvents() {
    window.addEventListener('keydown', event => {
        switch (String.fromCharCode(event.which)) {
            case 'F':
                clickElement(
                    document.querySelector('#flow-mode')
                );
                event.preventDefault();
                return false;
            case 'N':
                clickElement(
                    document.querySelector('#show-notes')
                );
                event.preventDefault();
                return false;
            default:
                break;
        }
    });
}