/// <reference path="../typings/index.d.ts" />
import { Theme } from "./renderer";
import { OritatamiRenderer } from "./renderer_oritatami";
import { SpaceFillRenderer } from "./renderer_spacefill";
import { OritatamiConfig } from "./oritatami";
import { Filler } from "./spacefilling";
import { CanvasManager } from "./canvas_manager";
import { Point, ConnectionType } from "./grid";
import * as $ from "jquery";

// Space filling
$(document).ready(() => {
    const paperManager = new CanvasManager("paper", 500, 500, 100);
    const oritatamiCanvas = new CanvasManager("oritatami", 500, 500, 100);
    const oritatami = this._oritatami = new OritatamiRenderer(oritatamiCanvas);
    const renderer = new SpaceFillRenderer(paperManager, oritatami, new Theme({
        a: "#000",
        z: "#F00"
    }));

    renderer.drawGrid();
    renderer.createSpaceFillHTML();
    oritatami.drawGrid();

    return false;
});
