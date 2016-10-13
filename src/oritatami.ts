// @flow
import { Grid, Point } from "./grid";

/**
 * Oritatami rule
 */
export class Rule {
    static seperator: string;

    /**
     * get rule internal key
     * @param t1 string value1
     * @param t2 string value2 
     * @return internal key 
     */
    static toKey(t1: string, t2: string): string {
        if (t1 < t2) {
            return `${t1}${Rule.seperator}${t2}`;
        } else {
            return `${t2}${Rule.seperator}${t1}`;
        }
    }

    _rules: {[key:string]:number};

    constructor() {
        this._rules = {};
    }

    /**
     * add new rule
     */
    add(t1: string, t2: string, power: number): this {
        let key = Rule.toKey(t1, t2);
        if (this._rules.hasOwnProperty(key)) {
            throw new Error("Wrong Rule definition! duplicated rule");
        } else {
            this._rules[key] = power;
            return this;
        }
    }

    /**
     * get rule
     */
    get(t1: string, t2: string): number {
        let key = Rule.toKey(t1, t2);
        if (this._rules.hasOwnProperty(key)) {
            return this._rules[key];
        } else {
            throw new Error("Not defined rule!");
        }
    }
}

Rule.seperator = String.fromCharCode(12288);

export class Oritatami {
    free: number;
    _ways: (number[])[];
    rule: Rule;

    constructor(free: number, rule: Rule) {
        this.free = free;
        this.rule = rule;
        this.generatePossibleWays();
    }

    getPower(grid: Grid, point: Point, value: string): number {
        let adjacents = grid.getNear(point);
        let ret = 0;

        let acc = (curVal: string) => {
            if (curVal == null) {
                return;
            }
            ret += this.rule.get(curVal, value);
        }
        acc(adjacents.u);
        acc(adjacents.lu);
        acc(adjacents.l);
        acc(adjacents.d);
        acc(adjacents.r);
        acc(adjacents.rd);

        return ret;
    }

    generatePossibleWays() {
        this._ways = [];

        let temporalGrid: Grid = new Grid();
        let point: Point = new Point(0, 0);
        temporalGrid.put(point, "");

        let generator = (way: number[], level : number) => {
            let idx = 0;
            let clonedWay = way.slice(0, way.length);
            for(let dir of Point.directions.toArray()) {
                point.add(dir);
                if (temporalGrid.put(point, "")) {
                    clonedWay.push(idx);
                    if (level > 1) {
                        generator(clonedWay, level - 1);
                    } else {
                        this._ways.push(clonedWay.slice(0, clonedWay.length));
                    }
                    clonedWay.pop();
                    temporalGrid.remove(point);
                }
                idx++;
                point.sub(dir);
            }
        };
        generator([], this.free);
    }
}