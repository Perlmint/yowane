/// <reference path="../typings/index.d.ts" />
import { Oritatami, Rule } from "./oritatami";
import { Grid, Point } from "./grid";

$(document).ready(() => {
    // Data
    let grid = new Grid();

    const rule = new Rule()
        .add("a", "a", 1)
        .add("b", "b", 1)
        .add("c", "c", 1)
        .add("d", "d", 1);

    grid.put(new Point(-1, 2), "d");
    grid.put(new Point(0, 1), "x");
    grid.put(new Point(0, 0), "c");
    grid.put(new Point(1, 0), "a");
    grid.put(new Point(1, 1), "x");
    grid.put(new Point(0, 2), "d");

    const ori = new Oritatami(3, rule);
    const itr = ori.push(grid, new Point(0, 2), "bxacxb");
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
    let paper = Raphael(0, 0, 500, 500);
    console.log(grid);

    let allPoints = grid.getAll();

    for (let i = 0; i < allPoints.length; ++i) {
        let elem = allPoints[i];
        let pt = elem[0];
        let val = elem[1];
        let x = 100 + pt.x * 100;
        let y = 100 + pt.y * 100;

        let nextElem: [Point, string];
        let nextPt: Point;
        let nextVal: string;
        let nextX: number;
        let nextY: number;

        if (i !== allPoints.length - 1) {
            nextElem = allPoints[i + 1];
            nextPt = nextElem[0];
            nextVal = nextElem[1];
            nextX = 100 + nextPt.x * 100;
            nextY = 100 + nextPt.y * 100;
        }

        paper.circle(x, y, 10);
        paper.text(x, y, val);

        if (nextElem !== null) {
            let pathStr = `M${x},${y}L${nextX},${nextY}`;
            console.log(pathStr);
            paper.path(pathStr);
        }
    }
});