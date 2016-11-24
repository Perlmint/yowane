/// <reference path="../typings/index.d.ts" />
import { Oritatami, Rule, OritatamiIterator, OritatamiConfig } from "./oritatami";
import { Grid, Point, Seeds, ConnectionType } from "./grid";
import { CanvasManager } from "./canvas_manager";
import "d3";
import * as Raphael from "raphael";
import * as $ from "jquery";

const NODE_ANIMATION_MS = 500;
const PATH_ANIMATION_MS = 300;

class AnimationContext {
    ms: number;
    easing: string;
}

export class Color {
    code: string;
    r: number;
    g: number;
    b: number;

    constructor(color: Color);
    constructor(codeOrName: string);
    constructor(r: number, g: number, b: number);
    constructor(a1: string | number | Color, a2?: number, a3?: number) {
        if (typeof a1 === "string") {
            this.code = a1;
        } else if (typeof a1 === "number") {
            this.r = a1;
            this.g = a2;
            this.b = a3;
        } else {
            this.code = a1.code;
            this.r = a1.r;
            this.g = a1.g;
            this.b = a1.b;
        }
    }

    toString(): string {
        if (this.code) {
            return this.code;
        } else {
            return `rgb(${this.r},${this.g},${this.b})`;
        }
    }
}

export class Theme {
    _data: { [key: string]: Color };

    constructor(config?: { [key: string]: string }) {
        this._data = {};
        if (config) {
            Object.keys(config).forEach(key => {
                this.setColor(key, new Color(config[key]));
            });
        }
    }

    setColor(type: string | string[], color: Color) {
        color = new Color(color);
        if (typeof type === "string") {
            this._data[type] = color;
        } else {
            type.forEach(t => {
                this._data[t] = color;
            });
        }
        return this;
    }

    get(type: string) {
        if (this._data[type] !== undefined) {
            return this._data[type].toString();
        } else {
            return "black";
        }
    }
}

export class Renderer {
    canvas: CanvasManager;
    paper: RaphaelPaper;
    _gridSet: RaphaelSet;
    _width: number;
    _height: number;
    _grid_size: number;
    _circle_size: number;
    _grid: Grid;
    _rule: Rule;
    _theme: Theme;

    get theme(): Theme {
        return this._theme;
    }

    constructor(canvas: CanvasManager, theme?: Theme) {
        this.canvas = canvas;
        this.paper = canvas.getPaper();
        this._width = this.paper.width;
        this._height = this.paper.height;
        this._grid_size = this.canvas.gridSize;
        this._circle_size = 10;
        this._grid = new Grid();
        this._theme = theme ? theme : new Theme();
    }

    drawGrid() {
        const size: number = 20;
        const color: string = "CCC";

        this.paper.setStart();

        for (let i = -size; i < size; ++i) {
            // X axis
            let point = new Point(i, -size);
            let nextPoint = new Point(i, size);

            this.drawConnection(point, nextPoint, ConnectionType.weak, null, color);

            // Y axis
            point = new Point(-size, i);
            nextPoint = new Point(size, i);

            this.drawConnection(point, nextPoint, ConnectionType.weak, null, color);

            // XY axis(?)
            point = new Point(i + size, -size);
            nextPoint = new Point(i - size, size);

            this.drawConnection(point, nextPoint, ConnectionType.weak, null, color);
        }

        this._gridSet = this.paper.setFinish();
    }

    drawCircle(p: Point, text: string, animation?: AnimationContext): RaphaelSet {
        const [x, y] = this.canvas.getScreenCoord(p);
        const attr = {
            fill: "white",
            "stroke": this._theme.get(text),
            "stroke-width": 3,
        };

        this.paper.setStart();
        if (animation) {
            this.paper.circle(x, y, 0).attr(attr).animate({ r: this._circle_size }, animation.ms, animation.easing);
            this.paper.text(x, y, text).attr({
                "font-size": 15,
                opacity: 0
            }).animate({ opacity: 1 }, animation.ms, animation.easing);
        } else {
            this.paper.circle(x, y, this._circle_size).attr(attr);
            this.paper.text(x, y, text).attr("font-size", 15);
        }

        return this.paper.setFinish();
    }

    drawConnection(p1: Point, p2: Point, type: ConnectionType, animation?: AnimationContext, color?: string) {
        const screenCoord = [this.canvas.getScreenCoord(p1), this.canvas.getScreenCoord(p2)];
        const pathStr = `M${screenCoord[0][0]} ${screenCoord[0][1]}L${screenCoord[1][0]} ${screenCoord[1][1]}`;

        const attr = {
            "stroke-dasharray": type === ConnectionType.strong ? "" : "- "
        };

        if (color) {
            attr["stroke"] = "#" + color;
        }

        if (animation) {

            this._drawPath(`M${screenCoord[0][0]} ${screenCoord[0][1]}L${screenCoord[0][0]} ${screenCoord[0][1]}`)
                .attr(attr)
                .toBack()
                .animate({ path: pathStr }, animation.ms, animation.easing);
        } else {
            this._drawPath(pathStr)
                .attr(attr)
                .toBack();
        }
    }

    _drawPath(path: string) {
        return this.paper.path(path);
    }
}