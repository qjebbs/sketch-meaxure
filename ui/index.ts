import { render } from "./render";
import { ProjectData } from "./common";

declare global {
    interface Window {
        meaxure: { render: (data: ProjectData) => void };
    }
}

window.meaxure = {
    render: render,
}
