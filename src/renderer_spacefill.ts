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
        const buttonDiv = $("<div class=\"buttons\"></div>");
        buttonList.append(buttonDiv);
        const endButton = $("<button class=\"btn btn-default\">end</button>");
        endButton.click(() => {
            this.onInputEnded();
        });
        buttonDiv.append(endButton);
        if (config) {
            this._filler = config;
        }
    }

    onInputEnded() {
        // input end!
        alert("End!");
        this.input.hoverEnabled = false;

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