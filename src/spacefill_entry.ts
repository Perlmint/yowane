/// <reference path="../typings/index.d.ts" />
import { Theme } from "./renderer";
import { OritatamiRenderer } from "./renderer_oritatami";
import { SpaceFillRenderer } from "./renderer_spacefill";
import { OritatamiConfig } from "./oritatami";
import { Filler } from "./spacefilling";
import { CanvasManager } from "./canvas_manager";
import { Point, ConnectionType } from "./grid";
import * as $ from "jquery";
import * as _ from "lodash";

// Space filling
$(document).ready(() => {
    const paperManager = new CanvasManager("paper", 500, 500, 100);
    const oritatamiCanvas = new CanvasManager("oritatami", 500, 500, 100);
    const keyGenerator = (dir: number) => {
        return Array.apply([], Array(20)).map((v, idx) => `${dir}${_.padStart((idx + 1).toString(), 2, "0")}`);
    };
    const oritatami = this._oritatami = new OritatamiRenderer(oritatamiCanvas, new Theme({
        c01: "#a69dd8",
        c02: "#0c35b0",
        c03: "#f82750",
        c04: "#0ebd31"
    }).setColor(keyGenerator(1), "#5fab4f").setColor(keyGenerator(2), "#c538cf")
    .setColor(keyGenerator(3), "#014a59").setColor(keyGenerator(4), "#e14af8")
    .setColor(keyGenerator(5), "#9fb730"));
    const renderer = new SpaceFillRenderer(paperManager, oritatami, new Theme({
        a: "#000",
        z: "#F00"
    }));

    renderer.drawGrid();
    renderer.createSpaceFillHTML();
    oritatami.drawGrid();

    return false;
});
