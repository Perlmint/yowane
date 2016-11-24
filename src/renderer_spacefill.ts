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
    _button: RaphaelSet;
    _buttonGlow: RaphaelSet;
    _dx: number;
    _dy: number;
    _scale: number;

    constructor(canvas: CanvasManager, theme?: Theme) {
        super(canvas, theme);
        this._dx = this._dy = 0;
        this._scale = 1;
        const showInputDiv = $("#input_sequence");
        this.input = new SpaceFillInputManager(canvas.paperElement, this, () => {
            showInputDiv.html(this.input.sequenceToString());
        });
        canvas.onZoom((prev, cur) => this.onZoom(prev, cur));
        canvas.onScroll((dx, dy) => this.onScroll(dx, dy));

        this.drawEndButton();
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

    drawEndButton() {
        this._button = this.paper.set()
        .push(this.paper.rect(2, 2, 100, 20, 1).toFront().attr({fill: "red", stroke: "red 1px", opacity: 0.5}))
        .push(this.paper.text(52, 12, "INPUT END"))
        .attr({
            cursor: "pointer",
            position: "fixed"
        })
        .mouseover(() => {
            this._buttonGlow = this._button.glow({
                width: 5, fill: true, opacity: 0.7
            });
        }).mouseout(() => {
            if (this._buttonGlow) {
                this._buttonGlow.remove();
            }
        }).click(() => this.onInputEnded());
    }

    onZoom(prev: number, cur: number) {
        this._scale = cur;
        this.updateButtonTransform();
    }

    onScroll(dx: number, dy: number) {
        this._dx = dx;
        this._dy = dy;
        this.updateButtonTransform();
    }

    updateButtonTransform() {
        this._button.transform(`S${this._scale}T${this._dx},${this._dy}`);
    }

    onInputEnded() {
        // input end!
        alert("End!");
    }

    drawMouseMove() {
        if (this._hover) {
            this._hover.remove();
        }

        if (this.input.hoverPt) {
            this._hover = this.drawCircle(this.input.hoverPt, "z");
            this._hover.attr({
                cursor: "pointer"
            });
            return this._hover;
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