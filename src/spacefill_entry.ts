/// <reference path="../typings/index.d.ts" />
import { Theme } from "./renderer";
import { SpaceFillRenderer } from "./renderer_spacefill";
import { OritatamiConfig } from "./oritatami";
import { Filler } from "./spacefilling";
import { CanvasManager } from "./canvas_manager";
import { Point, ConnectionType } from "./grid";
import * as $ from "jquery";

// Space filling
$(document).ready(() => {
    let paperManager = new CanvasManager("paper", 500, 500, 100);
    let renderer = new SpaceFillRenderer(paperManager, new Theme({
        a: "#000",
        z: "#F00",
    }));

    renderer.drawGrid();
    renderer.createSpaceFillHTML();

    return false;
});
