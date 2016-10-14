import { expect, assert } from "chai";
import { Oritatami, Rule } from "../src/oritatami";
import { Grid, Point } from "../src/grid";

describe("Oritatami", () => {
    it("ways", () => {
        let oritatami = new Oritatami(1, null);
        assert.equal(oritatami._ways.length, 6);
        const ways1 = [[0], [1], [2], [3], [4], [5]];
        assert.deepEqual(oritatami._ways, ways1);
    });

    it("example1-deterministic", () => {
        const grid = new Grid();
        grid.put(new Point(-1, 2), "d");
        grid.put(new Point(0, 1), "x");
        grid.put(new Point(0, 0), "c");
        grid.put(new Point(1, 0), "a");
        grid.put(new Point(1, 1), "x");
        grid.put(new Point(0, 2), "d");

        const rule = new Rule()
            .add("a", "a")
            .add("b", "b")
            .add("c", "c")
            .add("d", "d");

        const oritatami = new Oritatami(3, rule);
        const itr = oritatami.push(grid, new Point(0, 2), "bxacxb");
        const goNext = () => {
            const predicted = itr.predict();
            assert.equal(predicted.length, 1, `expected length - 1 but ${predicted}`);
            assert.isTrue(itr.next(predicted[0]), `expected success but failed. grid is ${grid}`);
        };
        goNext();
        assert.equal(grid.get(new Point(1, 2)), "b");
        goNext();
        assert.equal(grid.get(new Point(2, 1)), "x");
        goNext();
        assert.equal(grid.get(new Point(2, 0)), "a");
        goNext();
        assert.equal(grid.get(new Point(3, 0)), "c");
        goNext();
        assert.equal(grid.get(new Point(3, 1)), "x");
        goNext();
        assert.equal(grid.get(new Point(2, 2)), "b");
    });

    it("example2-nondeterministic", () => {
        const grid = new Grid();
        grid.put(new Point(0, 0), "d");
        grid.put(new Point(0, 1), "e");
        grid.put(new Point(-1, 2), "x");
        grid.put(new Point(-1, 3), "f");
        grid.put(new Point(0, 3), "x");
        grid.put(new Point(1, 3), "x");

        const rule = new Rule()
            .add("a", "f")
            .add("c", "e")
            .add("c", "d")
            .add("a", "d")
            .add("c", "f");

        const oritatami = new Oritatami(3, rule);
        let itr = oritatami.push(grid, new Point(0, 1), "abc");
        let predicted = itr.predict();
        assert.equal(predicted.length, 2);
        assert.include(predicted, new Point(1, 0));
        assert.include(predicted, new Point(0, 2));

        // path1
        itr.next(new Point(1, 0));
        predicted = itr.predict();
        assert.equal(predicted.length, 1);
        assert.include(predicted, new Point(1, 1));
        itr.next(predicted[0]);
        predicted = itr.predict();
        assert.equal(predicted.length, 1);
        assert.include(predicted, new Point(0, 2));
        itr.next(predicted[0]);
        assert.equal(grid.get(new Point(1, 0)), "a");
        assert.equal(grid.get(new Point(1, 1)), "b");
        assert.equal(grid.get(new Point(0, 2)), "c");

        // clean
        grid.remove(new Point(1, 0));
        grid.remove(new Point(1, 1));
        grid.remove(new Point(0, 2));

        // path2
        itr = oritatami.push(grid, new Point(0, 2), "abc");
        itr.predict();
        itr.next(new Point(0, 2));
        predicted = itr.predict();
        assert.equal(predicted.length, 1);
        assert.include(predicted, new Point(1, 1));
        itr.next(predicted[0]);
        predicted = itr.predict();
        assert.equal(predicted.length, 1);
        assert.include(predicted, new Point(1, 0));
        itr.next(predicted[0]);
        assert.equal(grid.get(new Point(0, 2)), "a");
        assert.equal(grid.get(new Point(1, 1)), "b");
        assert.equal(grid.get(new Point(1, 0)), "c");
    });
});