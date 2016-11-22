import * as Raphael from "raphael";

export class CanvasManager {
    // From this StackOverflow question:
    //    http://stackoverflow.com/a/9121092/895491
    // And code from this jsfiddle:
    //    http://jsfiddle.net/9zu4U/10/ 
    paper: RaphaelPaper;
    canvasID: string;
    dX: number = 0;
    dY: number = 0;
    oX: number = 0;
    oY: number = 0;

    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;

    mouseDown: boolean = false;

    constructor(canvasID: string, width: number, height: number) {
        /** Initialization code. 
        * If you use your own event management code, change it as required.
         */
        this.canvasID = canvasID;
        this.width = width;
        this.height = height;

        this.paper = Raphael(this.canvasID, this.width, this.height);

        const self = this;

        let startX: number = 0;
        let startY: number = 0;

        //Pan
        const paperElement = $("#" + this.canvasID);
        const svgEl = paperElement.children("svg")[0];
        svgEl.addEventListener("mousewheel", function (e) { self.wheel(e) });
        svgEl.addEventListener("DOMMouseScroll", function (e) { self.wheel(e) });
        paperElement.mousedown(function (e) {
            if (self.paper.getElementByPoint(e.pageX, e.pageY) !== null) {
                return;
            }

            self.mouseDown = true;
            startX = e.pageX;
            startY = e.pageY;
        });

        paperElement.mousemove(function (e) {
            if (self.mouseDown === false) { return; }
            self.dX = startX - e.pageX;
            self.dY = startY - e.pageY;

            const x = self.width / self.paper.width;
            const y = self.height / self.paper.height;

            self.dX *= x;
            self.dY *= y;

            self.paper.setViewBox(self.x + self.dX, self.y + self.dY, self.width, self.height, true);
        });

        paperElement.mouseup(function (e) {
            if (self.mouseDown === false) {
                return;
            }

            self.x += self.dX;
            self.y += self.dY;
            self.mouseDown = false;
        });
    }

    getPaper(): RaphaelPaper {
        return this.paper;
    }

    /** This is high-level function.
     * It must react to delta being more/less than zero.
     */
    handle(delta) {
        let oldWidth = this.width;
        let oldHeight = this.height;

        if (delta < 0) {
            this.width *= 0.95;
            this.height *= 0.95;
        } else {
            this.width *= 1.05;
            this.height *= 1.05;
        }

        this.x -= (this.width - oldWidth) / 2;
        this.y -= (this.height - oldHeight) / 2;
        this.paper.setViewBox(this.x, this.y, this.width, this.height, true);
    }

    /** Event handler for mouse wheel event.
     */
    wheel(event) {
        var delta = 0;
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
}
