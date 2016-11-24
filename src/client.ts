/// <reference path="../typings/index.d.ts" />
import { Renderer, Theme } from "./renderer";
import { OritatamiRenderer } from "./renderer_oritatami";
import { SpaceFillRenderer } from "./renderer_spacefill";
import { OritatamiConfig } from "./oritatami";
import { Filler } from "./spacefilling";
import { CanvasManager } from "./canvas_manager";
import { Point } from "./grid";
import * as $ from "jquery";

$(document).ready(() => {
    // Oritatami
    $("#oritatami-submit").click(() => {
        const configStr = $("#oritatami-input").val();
        const config = JSON.parse(configStr) as OritatamiConfig;

        let paperManager = new CanvasManager("paper", 500, 500, 100);
        let renderer = new OritatamiRenderer(paperManager, new Theme({
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

        renderer.oritatami = config;
        renderer.createOritatamiHTML();

        return false;
    });

    // Space filling
    $("#spacefill-submit").click(() => {
        const configStr = $("#spacefill-input").val();
        const config = JSON.parse(configStr) as OritatamiConfig;

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

        const paperElement = $("#paper");

        let sequence: Point[] = [];

        let nextPt: Point = null;
        let next: RaphaelSet = null;

        paperElement.mousemove(function (e) {
            let x = e.offsetX;
            let y = e.offsetY;

            let pt = paperManager.getNearestCoord(x, y);
            pt.x = Math.round(pt.x);
            pt.y = Math.round(pt.y);

            for (let i in sequence) {
                let temp = sequence[i];
                if (temp.x === pt.x && temp.y === pt.y) {
                    return;
                }
            }

            if (next) {
                next.remove();
            }

            next = renderer.drawCircle(pt, "z");
            nextPt = pt;
        });

        paperElement.mousedown(function (e) {
            if (next) {
                sequence.push(nextPt);
                renderer.drawCircle(nextPt, "a");
                next = null;
                nextPt = null;
            }
        });

        //        renderer.oritatami = config;
        renderer.createSpaceFillHTML();

        return false;
    });
});