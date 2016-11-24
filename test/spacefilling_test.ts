import { expect, assert } from "chai";
import { TriangleFiller } from "../src/spacefilling";
import { Oritatami, OritatamiIterator } from "../src/oritatami";
import { Grid, Point } from "../src/grid";

describe("SpaceFilling", () => {
    it("usage", () => {
        const filler = TriangleFiller;
        const seqs = filler.predictSequences("3331452145213542145151333234135421354151252415143132442432434532342423315214531433233332413453213354321335345122423333233413541251332424323445234234244231341514252151453124531235432133335142423514331315".split("").map(v => parseInt(v)));
        const oritatami = new Oritatami(filler.delay, filler.rule);
        const grid = new Grid();

        filler.initGrid(grid);

        let idx = 0;
        let itr = oritatami.push(grid, new Point(0, 0), seqs[0]); // first block
        function run(iterator: OritatamiIterator) {
            let innerIdx = 0;
            let lastPoint = null;
            do {
                const predicted = iterator.predict();
                if (predicted === null) {
                    break;
                }
                assert.equal(predicted.length, 1, `non deterministic or no result ${idx} ${iterator.seq[innerIdx]}, ${predicted}`);
                iterator.next(predicted[0]);
                lastPoint = predicted[0];
                idx++;
                innerIdx++;
            } while (true);
            return lastPoint;
        }
        let lp = run(itr);
        for (const blockSeq of seqs.slice(1)) {
            lp = run(oritatami.push(grid, lp, blockSeq));
        }
    });
});