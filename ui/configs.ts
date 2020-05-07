import { ArtboardData } from "../src/meaxure/interfaces"

interface State {
    zoom: number,
    unit: string,
    scale: number,
    artboardIndex: number,
    colorFormat: string,
    current: ArtboardData,
    maxSize: number,
    selectedIndex: number,
    codeType: string,
    targetIndex: number,
    tempTargetRect: any,
}

export const configs: State = <State>{
    zoom: 1,
    unit: 'px',
    scale: 1,
    artboardIndex: 0,
    colorFormat: 'color-hex',
    current: undefined,
    codeType:'css',
}
