/// <reference path="../typings/index.d.ts" />
import { Oritatami, Rule, OritatamiIterator, OritatamiConfig } from "./oritatami";
import { Grid, Point, Seeds, ConnectionType } from "./grid";
import { CanvasManager } from "./canvas_manager";
import "d3";
import * as Raphael from "raphael";
import * as $ from "jquery";
import { Renderer, Theme } from "./renderer";

const NODE_ANIMATION_MS = 500;
const PATH_ANIMATION_MS = 300;

class AnimationContext {
    ms: number;
    easing: string;
}

class RenderIterator {
    _renderer: OritatamiRenderer;
    _iterator: OritatamiIterator;
    _candidates: Point[];

    constructor(renderer: OritatamiRenderer, iterator: OritatamiIterator) {
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

export class OritatamiRenderer extends Renderer {
    paper: RaphaelPaper;
    _gridSet: RaphaelSet;
    _width: number;
    _height: number;
    _grid_size: number;
    _circle_size: number;
    _grid: Grid;
    _last_point: Point;
    _oritatami: Oritatami;
    _rule: Rule;
    _theme: Theme;
    _iterator: RenderIterator;

    get iterator(): RenderIterator {
        return this._iterator;
    }

    get theme(): Theme {
        return this._theme;
    }

    constructor(canvas: CanvasManager, grid_size?: number, theme?: Theme) {
        super(canvas, grid_size, theme);

        this.drawGrid();
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

    createOritatamiHTML(config?: OritatamiConfig) {
        let wrapper = $("#paper").empty();
        wrapper.append(this.paper.canvas);
        const buttonDiv = $("<div class=\"buttons\"></div>");
        wrapper.append(buttonDiv);
        const nextButton = $("<button class=\"btn btn-default\">next</button>");
        nextButton.click(() => {
            this._iterator.next();
            this._gridSet.toBack();
        });
        buttonDiv.append(nextButton);
        const autoButton = $("<button class=\"btn btn-default\">auto</button>");
        autoButton.click(() => {
            setInterval(() => {
                this._iterator.next();
                this._gridSet.toBack();
            }, Math.max(NODE_ANIMATION_MS, PATH_ANIMATION_MS));
        });
        buttonDiv.append(autoButton);
        if (config) {
            this.oritatami = config;
        }

        this._gridSet.toBack();
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
}