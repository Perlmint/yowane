/// <reference path="../typings/index.d.ts" />
import { Filler, TriangleFiller } from "./spacefilling";
import { SpaceFillInputManager } from "./spacefill_input_manager";
import { Grid, Point, Seeds, ConnectionType } from "./grid";
import { CanvasManager } from "./canvas_manager";
import "d3";
import * as Raphael from "raphael";
import * as $ from "jquery";
import { Renderer, Theme } from "./renderer";

const NODE_ANIMATION_MS = 500;
const PATH_ANIMATION_MS = 300;

export class SpaceFillRenderer extends Renderer {
    _filler: Filler;
    _hover: RaphaelSet;
    input: SpaceFillInputManager;
    onClick: () => void;

    constructor(canvas: CanvasManager, theme?: Theme) {
        super(canvas, theme);
        this.input = new SpaceFillInputManager(canvas.paperElement, this);

        this.drawGrid();
        this.input.initialClick();
    }

    createSpaceFillHTML(config?: Filler) {
        let wrapper = $("#paper").empty();
        wrapper.append(this.paper.canvas);

        if (config) {
            this._filler = config;
        }
    }

    drawMouseMove() {
        if (this._hover) {
            this._hover.remove();
        }

        if (this.input.hoverPt) {
            this._hover = this.drawCircle(this.input.hoverPt, "z");
        }
    }

    drawClick() {
        if (this._hover) {
            this._hover.remove();
            this._hover = null;
        }

        let sequence = this.input.sequence;
        let lastPt = this.input.sequence[this.input.sequence.length - 1];

        this.drawCircle(lastPt, "a");

        if (1 < sequence.length) {
            let prev = sequence[sequence.length - 2];
            this.drawConnection(lastPt, prev, ConnectionType.strong);
        }
    }
}