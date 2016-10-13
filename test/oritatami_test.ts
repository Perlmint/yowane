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

    it("example1", () => {
        let grid = new Grid();
        grid.put(new Point(0, 0), "c");
        grid.put(new Point(0, 1), "x");
        grid.put(new Point(-1, 2), "d");

        grid.put(new Point(-1, 0), " ");
        grid.put(new Point(-1, 1), " ");

        let rule = new Rule()
            .add("a", "a", 1)
            .add("b", "b", 1)
            .add("c", "c", 1)
            .add("d", "d", 1);

        let oritatami = new Oritatami(3, rule);
        const itr = oritatami.push(grid, new Point(0, 0), "axdbxacxb");
        itr.next();
        assert.equal(grid.get(new Point(1, 0)), "a");
        itr.next();
        assert.equal(grid.get(new Point(1, 1)), "x");
        itr.next();
        assert.equal(grid.get(new Point(0, 2)), "d");
        itr.next();
        assert.equal(grid.get(new Point(1, 2)), "b");
        itr.next();
        assert.equal(grid.get(new Point(2, 1)), "x");
        itr.next();
        assert.equal(grid.get(new Point(2, 0)), "a");
        itr.next();
        assert.equal(grid.get(new Point(3, 0)), "c");
        itr.next();
        assert.equal(grid.get(new Point(3, 1)), "x");
        itr.next();
        assert.equal(grid.get(new Point(2, 2)), "b");
    });
});