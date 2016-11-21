/// <reference path="../typings/index.d.ts" />
import { Renderer, Theme } from "./renderer";
import { Renderer1, Theme1 } from "./renderer_spacefill";
import { OritatamiConfig } from "./oritatami";
import { Filler } from "./spacefilling";
import * as $ from "jquery";

$(document).ready(() => {
    let renderer: Renderer;

    // Oritatami
    $("#oritatami-submit").click(() => {
        const configStr = $("#oritatami-input").val();
        const config = JSON.parse(configStr) as OritatamiConfig;
        renderer = new Renderer(500, 500, 100, new Theme({
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
        let renderer = new Renderer1(500, 500, 100, new Theme({
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

//        renderer.oritatami = config;
        renderer.createSpaceFillHTML();

        return false;
    });
});