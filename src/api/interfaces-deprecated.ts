import { SMColor } from "./interfaces";

export interface SMRect {
    x: number;
    y: number;
    width: number;
    height: number;
    setX?: (value: number) => void;
    setY?: (value: number) => void;
    setWidth?: (value: number) => void;
    setHeight?: (value: number) => void;
}

export interface SMGradient {
    type: string;
    from: SMPoint;
    to: SMPoint;
    colorStops: SMColorStop[];
}

export interface SMPoint {
    x: number;
    y: number;
}

export interface SMColorStop {
    color: SMColor;
    position: any;
}