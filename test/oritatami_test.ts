import { expect, assert } from "chai";
import { Oritatami, Rule } from "../src/oritatami";
import { Grid, Point } from "../src/grid";

describe("Rule", () => {
    it("basic", () => {
        const rule1 = new Rule()
            .add("a", "a")
            .add("b", "b")
            .add("c", "c")
            .add("d", "d");

        assert.equal(rule1.get("a", "a"), 1);
        assert.equal(rule1.get("a", "b"), 0);
        assert.equal(rule1.get("c", "c"), 1);
        assert.equal(rule1.get("x", "x"), 0);
    });

    it("reversible", () => {
        const rule = new Rule()
            .add("a", "f")
            .add("c", "e")
            .add("c", "d")
            .add("a", "d")
            .add("c", "f");

        assert.equal(rule.get("a", "f"), 1);
        assert.equal(rule.get("f", "a"), 1);
        assert.equal(rule.get("e", "d"), 0);
        assert.equal(rule.get("c", "e"), 1);
        assert.equal(rule.get("e", "c"), 1);
    });

    it("config", () => {
        const rule1 = new Rule()
            .add("a", "a")
            .add("b", "b")
            .add("c", "c")
            .add("d", "d");

        const rule2 = new Rule([
            ["a", "a"],
            ["b", "b"],
            ["c", "c"],
            ["d", "d"]]);
        assert.deepEqual(rule1, rule2);
    });
});

describe("Oritatami", () => {
    it("ways", () => {
        let oritatami = new Oritatami(1, null);
        assert.equal(oritatami._paths.length, 6);
        const ways1 = [[0], [1], [2], [3], [4], [5]];
        assert.deepEqual(oritatami._paths, ways1);
    });

    it("runWithConfig", () => {
        const itr = Oritatami.run({
            delay: 3,
            rule: [
                ["a", "a"],
                ["b", "b"],
                ["c", "c"],
                ["d", "d"]
            ],
            seed: [
                [-1, 2, "d"],
                [0, 1, "x"],
                [0, 0, "c"],
                [1, 0, "a"],
                [1, 1, "x"],
                [0, 2, "d"]
            ],
            sequence: "bxacxb".split("")
        });
        const grid = itr.grid;
        do {
            const predicted = itr.predict();
            if (predicted == null) {
                break;
            }
            itr.next(predicted[0]);
        } while (true);

        assert.equal(grid.get(new Point(1, 2)), "b");
        assert.equal(grid.get(new Point(2, 1)), "x");
        assert.equal(grid.get(new Point(2, 0)), "a");
        assert.equal(grid.get(new Point(3, 0)), "c");
        assert.equal(grid.get(new Point(3, 1)), "x");
        assert.equal(grid.get(new Point(2, 2)), "b");
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
        const itr = oritatami.push(grid, new Point(0, 2), "bxacxb".split(""));
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
        let itr = oritatami.push(grid, new Point(0, 1), "abc".split(""));
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
        itr = oritatami.push(grid, new Point(0, 2), "abc".split(""));
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