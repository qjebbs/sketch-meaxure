
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    maxX: number;
    maxY: number;
    setX: (value: number) => void;
    setY: (value: number) => void;
    setWidth: (value: number) => void;
    setHeight: (value: number) => void;
}

export interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
    "color-hex": string;
    "argb-hex": string;
    "css-rgba": string;
    "ui-color": string;
}
export interface Gradient {
    type: string;
    from: Point;
    to: Point;
    colorStops: ColorStop[];
}

export interface Point {
    x: number;
    y: number;
}

export interface ColorStop {
    color: Color;
    position: any;
}