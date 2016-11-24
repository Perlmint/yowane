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
        a: "#a69dd8",
        b: "#0c35b0",
        c: "#f82750",
        d: "#0ebd31",
        e: "#5fab4f",
        f: "#c538cf",
        g: "#014a59",
        h: "#e14af8",
        i: "#9fb730",
        j: "#4bec60",
        k: "#ef9345",
        l: "#d2ece0",
        m: "#9cda80",
        n: "#dbc07c",
        o: "#7328dd",
        p: "#1e9942",
        q: "#621b7b",
        r: "#c830b2",
        s: "#362332",
        t: "#e8c55d",
        u: "#bd8787",
        v: "#66c6a4",
        w: "#21ec4b",
        x: "#782364",
        y: "#c3bf15",
        z: "#3db35a"
    }));

    renderer.createSpaceFillHTML();

    return false;
});
