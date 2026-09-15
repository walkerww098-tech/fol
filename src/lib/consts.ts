export interface Circle {
    cx: number;
    cy: number;
    r: number;
}
export interface Point {
    x: number;
    y: number;
    angle: number;
}
export class Arc {
    x1: number = 0;
    y1: number = 0;
    x2: number = 0;
    y2: number = 0;
    r: number = 0;
    constructor(x1: number, y1: number, x2: number, y2: number, r: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.r = r;
    }
    d(): string {
        const s = "M " + this.x1.toFixed(0) + "," + this.y1.toFixed(0) +
            " A " + this.r + "," + this.r +
            " 0 0,1 " +
            this.x2.toFixed(0) + "," + this.y2.toFixed(0);
        return s;
    }
}
