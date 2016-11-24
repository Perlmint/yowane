import { CanvasManager } from "./canvas_manager";
import { SpaceFillRenderer } from "./renderer_spacefill";
import { Point } from "./grid";

export class SpaceFillInputManager {
    sequence: Point[] = [];
    sequenceAsDelta: number[] = [];

    hoverPt: Point;

    _paperElement: JQuery;
    _renderer: SpaceFillRenderer;

    constructor(paperElement: JQuery, renderer: SpaceFillRenderer) {
        this._paperElement = paperElement;
        this._renderer = renderer;

        $(paperElement).mousemove((e) => {
            this.mousemove(e.offsetX, e.offsetY);
            this._renderer.drawMouseMove();
        });

        $(paperElement).mousedown((e) => {
            // Left button only
            if (e.which !== 1) {
                return;
            }

            this.click(e.offsetX, e.offsetY);
            this._renderer.drawClick();
        });
    }

    mousemove(x: number, y: number) {
        let pt = this._renderer.canvas.getNearestCoord(x, y);
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

    click(x: number, y: number) {
        if (this.hoverPt) {
            this.sequence.push(this.hoverPt);

            this.hoverPt = null;

            if (1 < this.sequence.length) {
                let prev1 = this.sequence[this.sequence.length - 1];
                let prev2 = this.sequence[this.sequence.length - 2];

                let diff = new Point(prev1.x - prev2.x, prev1.y - prev2.y);

                let dirList = Point.directions.toArray();

                for (let i = 0; i < dirList.length; ++i) {
                    let dir = dirList[i];

                    if (dir.x === diff.x && dir.y === diff.y) {
                        this.sequenceAsDelta.push(i);
                    }
                }
            }
        }
    }
}