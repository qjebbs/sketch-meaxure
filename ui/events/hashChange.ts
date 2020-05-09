import { navigateByURLHash } from "./navigate";

export function hashChangeEvents() {
    window.addEventListener('hashchange', function () {
        navigateByURLHash();
    });
}