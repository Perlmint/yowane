import * as Raphael from "raphael";
import { Point } from "./grid";

const ZOOM_MAX = 5;
const ZOOM_MIN = 0.2;
const ZOOM_SPEED = 0.1;

export class CanvasManager {
    // From this StackOverflow question:
    //    http://stackoverflow.com/a/9121092/895491
    // And code from this jsfiddle:
    //    http://jsfiddle.net/9zu4U/10/ 
    canvasID: string;
    paper: RaphaelPaper;
    paperElement: JQuery;
    gridSize: number;

    dX: number = 0;
    dY: number = 0;

    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    zoom: number = 1;
    _onZoom: ((prev: number, current: number) => void)[];
    _onScroll: ((dx: number, dy: number) => void)[];

    mouseDown: boolean = false;

    constructor(canvasID: string, width: number, height: number, gridSize: number) {
        /** Initialization code. 
        * If you use your own event management code, change it as required.
         */
        this.canvasID = canvasID;
        this.paperElement = $("#" + this.canvasID);
        this.gridSize = gridSize;
        this.width = width;
        this.height = height;
        this._onZoom = [];
        this._onScroll = [];

        this.paper = Raphael(this.canvasID, this.width, this.height);

        const self = this;

        let startX: number = 0;
        let startY: number = 0;

        //Pan
        const svgEl = this.paperElement.children("svg")[0];
        svgEl.addEventListener("mousewheel", function (e) { self.wheel(e) });
        svgEl.addEventListener("DOMMouseScroll", function (e) { self.wheel(e) });
        this.paperElement.mousedown(function (e) {
            if (self.paper.getElementByPoint(e.pageX, e.pageY) !== null) {
                return;
            }

            // Right button only
            if (e.which !== 3) {
                return;
            }

            self.mouseDown = true;
            startX = e.pageX;
            startY = e.pageY;
        });

        this.paperElement.mousemove(function (e) {
            if (self.mouseDown === false) {
                return;
            }

            self.dX = (startX - e.pageX) * self.zoom;
            self.dY = (startY - e.pageY) * self.zoom;

            self.paper.setViewBox(self.x + self.dX, self.y + self.dY, self.width, self.height, true);
            for (const handler of self._onScroll) {
                handler(self.x + self.dX, self.y + self.dY);
            }
        });

        this.paperElement.mouseup(function (e) {
            if (self.mouseDown === false) {
                return;
            }

            // Right button only
            if (e.which !== 3) {
                return;
            }

            self.x += self.dX;
            self.y += self.dY;
            self.mouseDown = false;

            return;
        });

        this.paperElement.contextmenu(function () {
            return false;
        });
    }

    getPaper(): RaphaelPaper {
        return this.paper;
    }

    getZoom(): number {
        return this.zoom;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    /** This is high-level function.
     * It must react to delta being more/less than zero.
     */
    handle(delta) {
        let oldWidth = this.width;
        let oldHeight = this.height;
        const oldZoom = this.zoom;

        if (delta < 0) {
            this.zoom -= ZOOM_SPEED;
        } else {
            this.zoom += ZOOM_SPEED;
        }

        if (this.zoom < ZOOM_MIN) {
            this.zoom = ZOOM_MIN;
        } else if (this.zoom > ZOOM_MAX) {
            this.zoom = ZOOM_MAX;
        }

        this.width = this.paper.width * this.zoom;
        this.height = this.paper.height * this.zoom;

        this.x -= (this.width - oldWidth) / 2;
        this.y -= (this.height - oldHeight) / 2;
        this.paper.setViewBox(this.x, this.y, this.width, this.height, true);
        for (const handler of this._onZoom) {
            handler(oldZoom, this.zoom);
        }
    }

    /** Event handler for mouse wheel event.
     */
    wheel(event) {
        let delta = 0;
        if (!event) { /* For IE. */
            event = window.event;
        }
        if (event.wheelDelta) { /* IE/Opera. */
            delta = event.wheelDelta / 120;
        } else if (event.detail) { /** Mozilla case. */
            /** In Mozilla, sign of delta is different than in IE.
             * Also, delta is multiple of 3.
             */
            delta = -event.detail / 3;
        }
        /** If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta) {
            this.handle(delta);
        }
        /** Prevent default actions caused by mouse wheel.
         * That might be ugly, but we handle scrolls somehow
         * anyway, so don't bother here..
         */
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.returnValue = false;
    }

    getScreenCoord(p: Point): [number, number] {
        let tempX = p.x + Math.cos(Math.PI / 3) * p.y;
        let tempY = Math.sin(Math.PI / 3) * p.y;

        let retX = Math.round(this.gridSize * (1 + tempX));
        let retY = Math.round(this.paper.height - this.gridSize * (1 + tempY));

        return [retX, retY];
    }

    getNearestCoord(x: number, y: number, range?: number): Point {
        x = x * this.zoom + this.x;
        y = y * this.zoom + this.y;

        let pt = new Point();
        pt.y = ((this.paper.height - y) / this.gridSize - 1) / Math.sin(Math.PI / 3);
        pt.x = x / this.gridSize - Math.cos(Math.PI / 3) * pt.y - 1;

        return pt;
    }

    onZoom(handler: (prev: number, cur: number) => void) {
        this._onZoom.push(handler);
    }

    onScroll(handler: (dx: number, dy: number) => void) {
        this._onScroll.push(handler);
    }
}
