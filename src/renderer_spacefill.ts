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

const NODE_ANIMATION_MS = 500;
const PATH_ANIMATION_MS = 300;

export class SpaceFillRenderer extends Renderer {
    _filler: Filler;
    _hover: RaphaelSet;
    _hoverLine: RaphaelElement;
    input: SpaceFillInputManager;

    constructor(canvas: CanvasManager, theme?: Theme) {
        super(canvas, theme);
        const showInputDiv = $("#input_sequence");
        this.input = new SpaceFillInputManager(canvas.paperElement, this, () => {
            showInputDiv.html(this.input.sequenceToString());
        });

        this.drawGrid();
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

        const filler = TriangleFiller;
        const seqs = filler.predictSequences(this.input.relativeDirections);
        // const seqs = filler.predictSequences("3331452145213542145151333234".split("").map(v => parseInt(v)));
        const oritatami = new Oritatami(filler.delay, filler.rule);
        const grid = new Grid();

        filler.initGrid(grid);

        let idx = 0;
        let itr = oritatami.push(grid, new Point(0, 0), seqs[0]); // first block
        let lp = new Point(0, 0);

        function run(iterator: OritatamiIterator, seq: string[]) {
            let innerIdx = 0;
            let lastPoint = lp;
            do {
                const predicted = iterator.predict();
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
                    console.assert(predicted.length === 1, `non deterministic or no result ${idx} ${iterator.seq[innerIdx]}, ${predicted}`);
                    nextPoint = predicted[0];
                }
                iterator.next(nextPoint);
                lastPoint = new Point(nextPoint);
                idx++;
                innerIdx++;
            } while (true);
            return lastPoint;
        }

        // Run
        let predictList: Point[] = [];

        lp = run(itr, seqs[0]);
        predictList.push(lp);

        for (const blockSeq of seqs.slice(1)) {
            lp = run(oritatami.push(grid, lp, blockSeq), blockSeq);
            predictList.push(lp);
        }

        // Draw
        for (let pt of predictList) {
            this.drawCircle(pt, "f", false);
        }
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