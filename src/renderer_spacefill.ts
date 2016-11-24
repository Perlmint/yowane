/// <reference path="../typings/index.d.ts" />
import { Filler, TriangleFiller } from "./spacefilling";
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

    constructor(canvas: CanvasManager, theme?: Theme) {
        super(canvas, theme);

        this.drawGrid();
    }

    createSpaceFillHTML(config?: Filler) {
        let wrapper = $("#paper").empty();
        wrapper.append(this.paper.canvas);

        const buttonDiv = $("<div class=\"buttons\"></div>");
        wrapper.append(buttonDiv);

        const nextButton = $("<button class=\"btn btn-default\">next</button>");
        nextButton.click(() => {
        });
        buttonDiv.append(nextButton);

        const autoButton = $("<button class=\"btn btn-default\">auto</button>");
        autoButton.click(() => {
            setInterval(() => {
            }, Math.max(NODE_ANIMATION_MS, PATH_ANIMATION_MS));
        });
        buttonDiv.append(autoButton);

        if (config) {
            this._filler = config;
        }
    }
}