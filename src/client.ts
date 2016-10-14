/// <reference path="../typings/index.d.ts" />
import { Oritatami } from "./oritatami";
import { Grid, Point } from "./grid";
import "d3";
import * as Raphael from "raphael";
import * as $ from "jquery";

$(document).ready(() => {
    const itr = Oritatami.run({
        delay: 3,
        rule: [
            ["a", "a"],
            ["b", "b"],
            ["c", "c"],
            ["d", "d"]
        ],
        seed: [
            [-1, 2, "d"],
            [0, 1, "x"],
            [0, 0, "c"],
            [1, 0, "a"],
            [1, 1, "x"],
            [0, 2, "d"]
        ],
        sequence: "bxacxb"
    });

    const grid = itr.grid; 
    const goNext = () => {
        const predicted = itr.predict();

        if (predicted === null) {
            return true;
        }

        if (predicted.length !== 1) {
            alert(`Expected length is 1, but value is ${predicted}`);
        }

        if (itr.next(predicted[0]) === false) {
            alert(`Expectation failed.  Grid is ${grid}`);
        }

        return false;
    };

    while (goNext() === false);

    // View
    const initialCount = 6;

    let paper = Raphael(0, 0, 500, 500);

    let allPoints = grid.getAll();
    let circleList: [number, number, string][] = [];
    let pathStrList: Array<string> = Array<string>();

    for (let i = 0; i < allPoints.length; ++i) {
        let elem = allPoints[i];
        let pt = elem[0];
        let val = elem[1];
        let screenCoord = getScreenCoord(pt.x, pt.y);

        let nextElem: [Point, string] = null;
        let nextPt: Point;
        let nextVal: string;
        let nextScreenCoord: [number, number];

        if (i !== allPoints.length - 1) {
            nextElem = allPoints[i + 1];
            nextPt = nextElem[0];
            nextVal = nextElem[1];
            nextScreenCoord = getScreenCoord(nextPt.x, nextPt.y);
        }

        let circle: [number, number, string] = [screenCoord[0], screenCoord[1], val];
        circleList.push(circle);

        if (nextElem !== null) {
            let pathStr = `M${screenCoord[0]},${screenCoord[1]}L${nextScreenCoord[0]},${nextScreenCoord[1]}`;
            pathStrList.push(pathStr);
        }
    }

    let lastCircle: [number, number, string] = null;

    if (initialCount <= circleList.length) {
        let initialCircleLsit = circleList.splice(0, initialCount);
        let initialPathList = pathStrList.splice(0, initialCount - 1);

        lastCircle = initialCircleLsit[initialCount - 1];

        initialPathList.forEach(path => {
            drawPath(paper, path);
        });

        initialCircleLsit.forEach(element => {
            let x = element[0];
            let y = element[1];
            let text = element[2];

            drawCircle(paper, x, y, text);
        });
    }

    let drawFuncList: Function[] = [];

    for (let i = 0; i < circleList.length + pathStrList.length; ++i) {
        if (i % 2 === 0) {
            drawFuncList.push(() => {
                let index = i / 2;

                let elem = circleList[index];
                let x = elem[0];
                let y = elem[1];
                let text = elem[2];

                drawCircle(paper, x, y, text);
            });
        } else {
            drawFuncList.push(() => {
                let index = (i - 1) / 2;

                let prevElem: [number, number, string] = null;
                if (index === 0) {
                    prevElem = lastCircle;
                } else {
                    prevElem = circleList[index - 1];
                }

                let nextElem = circleList[index];
                let path = pathStrList[index];

                drawPath(paper, path);
                drawCircle(paper, prevElem[0], prevElem[1], prevElem[2]);
                drawCircle(paper, nextElem[0], nextElem[1], nextElem[2]);
            });
        }
    }

    let drawIndex = 0;
    let timeID = window.setInterval(() => {
        if (drawFuncList.length <= drawIndex) {
            clearInterval(timeID);
            return;
        }

        drawFuncList[drawIndex]();
        ++drawIndex;
    }, 300);
});

function drawCircle(paper: RaphaelPaper, x: number, y: number, text: string) {
    paper.circle(x, y, 10).attr("fill", "#FFFFFF");
    paper.text(x, y, text).attr("font-size", 15);
}

function drawPath(paper: RaphaelPaper, path: string) {
    paper.path(path);
}

function getScreenCoord(x: number, y): [number, number] {
    let tempX = x + Math.cos(Math.PI / 3) * y;
    let tempY = Math.sin(Math.PI / 3) * y;

    let retX = 100 * (1 + tempX);
    let retY = 100 * (1 + tempY);

    let ret: [number, number] = [retX, retY];

    return ret;
}