export function eventDelegate<K extends keyof HTMLElementEventMap>(
    parent: string | Element,
    type: K,
    target: string,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions
): void {
    if (typeof parent == 'string') {
        document.querySelectorAll(parent).forEach(
            el => el.addEventListener(type, wrappedListener)
        );
        return;
    }
    parent.addEventListener(type, wrappedListener);
    function wrappedListener(event: HTMLElementEventMap[K]) {
        let targetElement = event.target as HTMLElement;
        let parentElement = event.currentTarget;
        while (targetElement !== parentElement) {
            if (targetElement.matches(target)) {
                listener.call(targetElement, ...arguments);
                return;
            }
            targetElement = targetElement.parentElement;
        }
    }
}