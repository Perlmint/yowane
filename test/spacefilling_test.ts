import { expect, assert } from "chai";
import { TriangleFiller } from "../src/spacefilling";
import { Oritatami, OritatamiIterator } from "../src/oritatami";
import { Grid, Point } from "../src/grid";

describe("SpaceFilling", () => {
    it("usage", () => {
        const filler = TriangleFiller;
        const seqs = filler.predictSequences("3331452145213542145151333234".split("").map(v => parseInt(v)));
        const oritatami = new Oritatami(filler.delay, filler.rule);
        const grid = new Grid();

        filler.initGrid(grid);

        let idx = 0;
        let itr = oritatami.push(grid, new Point(0, 0), seqs[0]); // first block
        let lp = new Point(0, 0);
        function run(iterator: OritatamiIterator, seq: string[]) {
            let innerIdx = 0;
            let lastPoint = lp;
            do {
                const predicted = iterator.predict();
                if (predicted === null) {
                    break;
                }
                let nextPoint: Point;
                if (innerIdx === 0) {
                    const near = grid.getNear(lastPoint);
                    let nearIdx = 0;
                    for (const p of [near.l, near.lu, near.u, near.r, near.rd, near.d]) {
                        if (p === "c03") {
                            if (seq[innerIdx][0] === "5") {
                                nextPoint = Point.directions.toArray()[(nearIdx + 1) % 6];
                            } else {
                                nextPoint = Point.directions.toArray()[(nearIdx + 3) % 6];
                            }
                            nextPoint = Point.added(lastPoint, nextPoint);
                            break;
                        }
                        nearIdx++;
                    }
                }
                else if (seq[innerIdx] === "513") {
                    const near = grid.getNear(lastPoint);
                    let nearIdx = 0;
                    for (const p of [near.l, near.lu, near.u, near.r, near.rd, near.d, near.c]) {
                        if (p === "511") {
                            nextPoint = Point.directions.toArray()[(nearIdx + 3) % 6];
                            nextPoint = Point.added(lastPoint, nextPoint);
                            break;
                        }
                        nearIdx++;
                    }
                }
                else {
                    assert.equal(predicted.length, 1, `non deterministic or no result ${idx} ${iterator.seq[innerIdx]}, ${predicted}`);
                    nextPoint = predicted[0];
                }
                iterator.next(nextPoint);
                lastPoint = new Point(nextPoint);
                idx++;
                innerIdx++;
            } while (true);
            return lastPoint;
        }
        lp = run(itr, seqs[0]);
        for (const blockSeq of seqs.slice(1)) {
            lp = run(oritatami.push(grid, lp, blockSeq), blockSeq);
        }
    });
});