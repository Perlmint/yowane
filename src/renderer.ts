/// <reference path="../typings/index.d.ts" />
import {Oritatami, Rule, OritatamiIterator, OritatamiConfig} from "./oritatami";
import {Grid, Point, Seeds, ConnectionType} from "./grid";
import "d3";
import * as Raphael from "raphael";
import * as $ from "jquery";

const NODE_ANIMATION_MS = 500;
const PATH_ANIMATION_MS = 300;

class AnimationContext {
    ms: number;
    easing: string;
}

class RenderIterator {
    _renderer: Renderer;
    _iterator: OritatamiIterator;
    _candidates: Point[];

    constructor(renderer: Renderer, iterator: OritatamiIterator) {
        this._renderer = renderer;
        this._iterator = iterator;
        this._candidates = null;
    }

    next(choice?: Point): Point[] {
        if (choice == null && this._candidates != null) {
            if (this._candidates.length === 1) {
                choice = this._candidates[0];
            } else {
                throw new Error("Select one point from cadiates");
            }
        }
        if (choice) {
            this._iterator.next(choice);
            this._renderer.drawNode(choice, {
                ms: NODE_ANIMATION_MS,
                easing: "elastic"
            }, {
                ms: PATH_ANIMATION_MS,
                easing: "easeOut"
            });
        }
        this._candidates = this._iterator.predict();
        return this._candidates;
    }

    isDone(): boolean {
        return this._iterator.predict() == null;
    }
}

export class Renderer {
    paper: RaphaelPaper;
    _width: number;
    _height: number;
    _grid_size: number;
    _circle_size: number;
    _grid: Grid;
    _last_point: Point;
    _oritatami: Oritatami;
    _rule: Rule;
    _iterator: RenderIterator;

    get iterator(): RenderIterator {
        return this._iterator;
    }

    constructor(container: HTMLElement, width: number, height: number, grid_size?: number, config?: OritatamiConfig) {
        this.paper = Raphael(container, width, height);
        this._grid_size = grid_size ? grid_size : 100;
        this._circle_size = 10;
        this._grid = new Grid();
        this._width = width;
        this._height = height;
        const wrapper = $("<div></div>");
        this.paper.canvas.parentElement.replaceChild(wrapper[0], this.paper.canvas);
        wrapper.append(this.paper.canvas);
        const buttonDiv = $("<div class=\"buttons\"></div>");
        wrapper.append(buttonDiv);
        const nextButton = $("<button class=\"btn btn-default\">next</button>");
        nextButton.click(() => {
            this._iterator.next();
        });
        buttonDiv.append(nextButton);
        const autoButton = $("<button class=\"btn btn-default\">auto</button>");
        autoButton.click(() => {
            setInterval(() => {
                this._iterator.next();
            }, Math.max(NODE_ANIMATION_MS, PATH_ANIMATION_MS));
        });
        buttonDiv.append(autoButton);
        if (config) {
            this.oritatami = config;
        }
    }

    set oritatami(v: OritatamiConfig) {
        this._rule = new Rule(v.rule);
        this._oritatami = new Oritatami(v.delay, this._rule);
        this._setSeeds(v.seed);
        this._createIterator(v.sequence);
    }

    _createIterator(seq: string[]) {
        const itr = this._oritatami.push(this._grid, this._last_point, seq);
        this._iterator = new RenderIterator(this, itr);
    }

    _setSeeds(seeds: Seeds) {
        let prevPoint: Point = null;
        for (const seed of seeds) {
            const curPoint = new Point(seed[0], seed[1]);
            if (!this._grid.put(curPoint, seed[2])) {
                throw new Error("Invalid seed!");
            }
            this.drawNode(curPoint);
            prevPoint = curPoint;
        }
    }

    drawNode(point: Point, nodeAnimation?: AnimationContext, pathAnimation?: AnimationContext) {
        const near = this._grid.getNear(point);
        this.drawCircle(point, near.c, nodeAnimation);
        const weakConnected: Point[] = [];
        for (const info of Point.directions.nearToArray(near)) {
            const rel = this._oritatami.rule.get(info[1], near.c);
            const absPoint = point.add(info[0]);
            if (absPoint === this._last_point) {
                continue;
            } else if (rel !== 0) {
                weakConnected.push(new Point(absPoint));
            }
        }

        for (const connected of weakConnected) {
            this.drawConnection(connected, point, ConnectionType.weak, pathAnimation);
        }
        if (this._last_point) {
            this.drawConnection(this._last_point, point, ConnectionType.strong, pathAnimation);
        }
        this._last_point = new Point(point);
    }

    drawCircle(p: Point, text: string, animation?: AnimationContext) {
        const [x, y] = this._getScreenCoord(p);
        const attr = {
            fill: "#FFFFFF", // TODO : color
            "stroke-width": 3,
        };
        if (animation) {
            this.paper.circle(x, y, 0).attr(attr).animate({r: this._circle_size}, animation.ms, animation.easing);
            this.paper.text(x, y, text).attr({
                "font-size": 15,
                opacity: 0
            }).animate({opacity: 1}, animation.ms, animation.easing);
        } else {
            this.paper.circle(x, y, this._circle_size).attr(attr);
            this.paper.text(x, y, text).attr("font-size", 15);
        }
    }

    drawConnection(p1: Point, p2: Point, type: ConnectionType, animation?: AnimationContext) {
        const screenCoord = [this._getScreenCoord(p1), this._getScreenCoord(p2)];
        const pathStr = `M${screenCoord[0][0]} ${screenCoord[0][1]}L${screenCoord[1][0]} ${screenCoord[1][1]}`;
        if (animation) {
            this._drawPath(`M${screenCoord[0][0]} ${screenCoord[0][1]}L${screenCoord[0][0]} ${screenCoord[0][1]}`)
                .attr("stroke-dasharray", type === ConnectionType.strong ? "" : "- ")
                .toBack()
                .animate({path: pathStr}, animation.ms, animation.easing);
        } else {
            this._drawPath(pathStr)
                .attr("stroke-dasharray", type === ConnectionType.strong ? "" : "- ")
                .toBack();
        }
    }

    _drawPath(path: string) {
        return this.paper.path(path);
    }

    _getScreenCoord(p: Point): [number, number] {
        let tempX = p.x + Math.cos(Math.PI / 3) * p.y;
        let tempY = Math.sin(Math.PI / 3) * p.y;

        let retX = Math.round(this._grid_size * (1 + tempX));
        let retY = Math.round(this._height - this._grid_size * (1 + tempY));

        return [retX, retY];
    }
}