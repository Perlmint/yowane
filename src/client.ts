/// <reference path="../typings/index.d.ts" />
import {Renderer} from "./renderer";
import * as $ from "jquery";

$(document).ready(() => {
    let renderer: Renderer;
    $("#oritatami-submit").click(() => {
        const configStr = $("#oritatami-input").text();
        const config = JSON.parse(configStr);
        renderer = new Renderer($("#paper")[0], 500, 500, 100, config);
        return false;
    });
});