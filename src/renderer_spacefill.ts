/// <reference path="../typings/index.d.ts" />
import { Filler, TriangleFiller } from "./spacefilling";
import { SpaceFillInputManager } from "./spacefill_input_manager";
import { Grid, Point, Seeds, ConnectionType } from "./grid";
import { CanvasManager } from "./canvas_manager";
import { Oritatami, OritatamiIterator } from "./oritatami";
import "d3";
import * as Raphael from "raphael";
import * as $ from "jquery";
import { Renderer, Theme } from "./renderer";
import { OritatamiRenderer, RenderIterator } from "./renderer_oritatami";

const NODE_ANIMATION_MS = 500;
const PATH_ANIMATION_MS = 300;

export class SpaceFillRenderer extends Renderer {
    _filler: Filler;
    _hover: RaphaelSet;
    _hoverLine: RaphaelElement;
    _oritatamiCanvas: CanvasManager;
    _oritatami: OritatamiRenderer;
    _oritatamiItr: IterableIterator<Boolean>;
    input: SpaceFillInputManager;

    constructor(canvas: CanvasManager, oritatami: CanvasManager, theme?: Theme) {
        super(canvas, theme);
        this._oritatamiCanvas = oritatami;
        const showInputDiv = $("#input_sequence");
        this.input = new SpaceFillInputManager(canvas.paperElement, this, () => {
            showInputDiv.html(this.input.sequenceToString());
        });

        this.input.initialClick();
    }

    createSpaceFillHTML(config?: Filler) {
        let wrapper = $("#paper").empty();
        wrapper.append(this.paper.canvas);

        let buttonList = $("#button_list");
        const endButton = $("<button class=\"btn btn-default\">end</button>");
        endButton.click(() => {
            this.onInputEnded();
        });
        buttonList.append(endButton);
        if (config) {
            this._filler = config;
        }
    }

    onInputEnded() {
        this.input.hoverEnabled = false;

        this._removeHover();

        const wrapper = $("#paper").empty();
        const filler = TriangleFiller;
        const fillSeqs = filler.predictSequences(this.input.relativeDirections);
        const oritatami = this._oritatami = new OritatamiRenderer(this._oritatamiCanvas);
        oritatami.drawGrid();
        oritatami.createOritatamiHTML();
        oritatami.oritatami = {
            delay: filler.delay,
            rule: filler.rule,
            seed: filler.seed.map<[number, number, string]>(v => ([v[1].x, v[1].y, v[0]] as [number, number, string])),
            sequence: []
        };
        const grid = oritatami._grid;

        let idx = 0;
        let itr = oritatami.iterator;
        let lp = new Point(0, 0);

        function* run(seqs: string[][]) {
            let innerIdx = 0;
            let lastPoint = lp;
            for (const seq of seqs) {
                oritatami.createIterator(seq);
                const iterator = oritatami.iterator;
                do {
                    const predicted = iterator.next();
                    if (predicted === null) {
                        break;
                    }
                    let nextPoint: Point;
                    if (innerIdx === 0) {
                        const near = grid.getNear(lastPoint);
                        let nearIdx = 0;
                        for (const p of [near.l, near.lu, near.u, near.r, near.rd, near.d]) {
                            if (p === "c03") {
                                if (seq[innerIdx][0] === "5") {
                                    nextPoint = Point.directions.toArray()[(nearIdx + 1) % 6];
                                } else {
                                    nextPoint = Point.directions.toArray()[(nearIdx + 3) % 6];
                                }
                                nextPoint = Point.added(lastPoint, nextPoint);
                                break;
                            }
                            nearIdx++;
                        }
                    }
                    else if (seq[innerIdx] === "513") {
                        const near = grid.getNear(lastPoint);
                        let nearIdx = 0;
                        for (const p of [near.l, near.lu, near.u, near.r, near.rd, near.d, near.c]) {
                            if (p === "511") {
                                nextPoint = Point.directions.toArray()[(nearIdx + 3) % 6];
                                nextPoint = Point.added(lastPoint, nextPoint);
                                break;
                            }
                            nearIdx++;
                        }
                    }
                    else {
                        console.assert(predicted.length === 1, `non deterministic or no result ${idx} ${seq[innerIdx]}, ${predicted}`);
                        nextPoint = predicted[0];
                    }
                    iterator.next(nextPoint);
                    lastPoint = new Point(nextPoint);
                    idx++;
                    innerIdx++;
                    yield true;
                } while (true);
            }
            yield false;
        }

        this._oritatamiItr = run(fillSeqs);
        this._oritatami.onNext = () => this.onOritatamiNext();
    }

    onOritatamiNext() {
        this._oritatamiItr.next();
    }

    drawMouseMove() {
        if (this.input.hoverEnabled === false) {
            return;
        }

        this._removeHover();

        if (this.input.hoverPt) {
            let lastPt = this.input.sequence[this.input.sequence.length - 1];

            this._hover = this.drawCircle(this.input.hoverPt, "z", false);
            this._hoverLine = this.drawConnection(lastPt, this.input.hoverPt, ConnectionType.strong, null, "F00");
            this._gridToBack();
        }
    }

    drawClick() {
        this._removeHover();

        let sequence = this.input.sequence;
        let lastPt = this.input.sequence[this.input.sequence.length - 1];

        this.drawCircle(lastPt, "a", false);

        if (1 < sequence.length) {
            let prev = sequence[sequence.length - 2];
            this.drawConnection(lastPt, prev, ConnectionType.strong);
        }

        this._gridToBack();
    }

    _removeHover() {
        if (this._hover) {
            this._hover.remove();
            this._hoverLine.remove();

            this._hover = null;
            this._hoverLine = null;
        }
    }
}