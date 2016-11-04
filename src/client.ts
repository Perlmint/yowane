/// <reference path="../typings/index.d.ts" />
import {Renderer, Theme} from "./renderer";
import {OritatamiConfig} from "./oritatami";
import * as $ from "jquery";

$(document).ready(() => {
    let renderer: Renderer;
    $("#oritatami-submit").click(() => {
        const configStr = $("#oritatami-input").text();
        const config = JSON.parse(configStr) as OritatamiConfig;
        renderer = new Renderer(500, 500, 100, new Theme({
            a: "red",
            b: "lime",
            c: "#1E90FF",
            d: "#FF1493"
        }));
        renderer.oritatami = config;
        return false;
    });
});