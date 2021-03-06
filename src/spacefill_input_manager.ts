import { CanvasManager } from "./canvas_manager";
import { SpaceFillRenderer } from "./renderer_spacefill";
import { Point } from "./grid";
import * as renderJSON from "json-beautify";

export class SpaceFillInputManager {
    sequence: Point[] = [];
    absoluteDirections: number[] = [1];
    relativeDirections: number[] = [];

    hoverPt: Point;

    _onClick: () => void;
    _paperElement: JQuery;
    _renderer: SpaceFillRenderer;

    constructor(paperElement: JQuery, renderer: SpaceFillRenderer, onClickHandler: () => void) {
        this._paperElement = paperElement;
        this._renderer = renderer;
        this._onClick = onClickHandler;

        $(paperElement).mousemove((e) => {
            let pt = this._renderer.canvas.getNearestCoord(e.offsetX, e.offsetY);

            this.mousemove(pt);
            this._renderer.drawMouseMove();
        });

        $(paperElement).mousedown((e) => {
            // Left button only
            if (e.which !== 1) {
                return;
            }

            if (this.hoverPt != null) {
                this.click(this.hoverPt);
                this._renderer.drawClick();
            }

            if (this._onClick) {
                this._onClick();
            }
        });
    }

    initialClick() {
        let pt = new Point(0, 0);
        this.click(pt);
        this._renderer.drawClick();
    }

    mousemove(pt: Point) {
        if (this._renderer.done === true) {
            return;
        }

        pt.x = Math.round(pt.x);
        pt.y = Math.round(pt.y);

        for (let i in this.sequence) {
            let prevPt = this.sequence[i];
            if (prevPt.x === pt.x && prevPt.y === pt.y) {
                return;
            }
        }

        if (0 < this.sequence.length) {
            let lastPt = this.sequence[this.sequence.length - 1];

            let dX = pt.x - lastPt.x;
            let dY = pt.y - lastPt.y;

            // Only 6 surrounding dots
            if (((Math.abs(dX) === 0 || Math.abs(dX) === 1) && (Math.abs(dY) === 0 || Math.abs(dY) === 1)) === false
                || (dX * dY === 1)) {
                return;
            }
        }

        this.hoverPt = pt;
    }

    click(pt: Point) {
        if (this._renderer.done === true) {
            return;
        }

        this.hoverPt = null;
        this.sequence.push(pt);

        if (1 < this.sequence.length) {
            let prev1 = this.sequence[this.sequence.length - 1];
            let prev2 = this.sequence[this.sequence.length - 2];

            let diff = new Point(prev1.x - prev2.x, prev1.y - prev2.y);

            let dirList = Point.directions.toArray();

            for (let i = 0; i < dirList.length; ++i) {
                let dir = dirList[i];

                if (dir.x === diff.x && dir.y === diff.y) {
                    this.absoluteDirections.push(i);
                    const lastDirection = this.absoluteDirections[this.absoluteDirections.length - 2];
                    const relativeDirection = (i - lastDirection + 3) % 6;
                    this.relativeDirections.push(relativeDirection < 0 ? relativeDirection + 6 : relativeDirection);
                }
            }
        }
    }

    sequenceToString(): string {
        const sequences = this.sequence.map(pt => `(${pt.x}, ${pt.y})`);
        return renderJSON({
            sequence: sequences,
            direction_sequence: this.relativeDirections
        }, null, 2, 66);
    }
}