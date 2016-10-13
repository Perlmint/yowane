import { expect, assert } from "chai";
import { Grid, Point } from "../src/grid";

describe("Point", () => {
    it("add", () => {
        let point = new Point(0, 0);
        point = point.add(new Point(1, -1));
        assert.equal(point.x, 1);
        assert.equal(point.y, -1);

        point = point.add(new Point(10, 20));
        assert.equal(point.x, 11);
        assert.equal(point.y, 19);
    });
});

describe("Grid", () => {
    it("put", () => {
        let grid = new Grid();
        assert.isTrue(grid.put(new Point(0, 0), "a"));
        assert.isFalse(grid.put(new Point(0, 0), "b"));
        assert.isTrue(grid.put(new Point(0, 1), "c"));
    });

    it("remove", () => {
        let grid = new Grid();
        assert.isFalse(grid.remove(new Point(0, 0)));
        assert.isTrue(grid.put(new Point(0, 0), "a"));
        assert.isFalse(grid.put(new Point(0, 0), "b"));
        assert.isTrue(grid.remove(new Point(0, 0)));
    });

    it("get", () => {
        let grid = new Grid();
        assert.isNull(grid.get(new Point(0, 0)));
        assert.isTrue(grid.put(new Point(0, 0), "a"));
        assert.isTrue(grid.put(new Point(0, 1), "b"));
        assert.equal(grid.get(new Point(0, 0)), "a");
        assert.equal(grid.get(new Point(0, 1)), "b");
    });

    it("getAdjacent", () => {
        let grid = new Grid();
        assert.isTrue(grid.put(Point.directions.c, "a"));
        assert.isTrue(grid.put(Point.directions.lu, "b"));
        assert.isTrue(grid.put(Point.directions.u, "c"));
        assert.isTrue(grid.put(Point.directions.r, "d"));
        assert.isTrue(grid.put(Point.directions.rd, "e"));
        assert.isTrue(grid.put(Point.directions.d, "f"));
        assert.isTrue(grid.put(Point.directions.l, "g"));

        const near = grid.getNear(new Point(0, 0));
        assert.isNotNull(near);
        assert.equal(near.c, "a");
        assert.equal(near.d, "f");
        assert.equal(near.rd, "e");
        assert.equal(near.r, "d");
        assert.equal(near.l, "g");
        assert.equal(near.lu, "b");
        assert.equal(near.u, "c");

        const near2 = grid.getNear(new Point(1, 0));
        assert.isNotNull(near2);
        assert.equal(near2.c, "d");
        assert.equal(near2.l, "a");
        assert.equal(near2.lu, "c");
        assert.equal(near2.d, "e");
        assert.isNull(near2.r);
        assert.isNull(near2.rd);
    });
});