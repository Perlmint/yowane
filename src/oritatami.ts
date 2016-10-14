// @flow
import { Grid, Point } from "./grid";

export type RuleConfig = [string, string][];
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

    

    _rules: {[key: string]: number};

    constructor();
    constructor(config: RuleConfig);
    constructor(config?: RuleConfig) {
        this._rules = {};
        if (config != null) {
            for (let rule of config) {
                this.add(rule[0], rule[1]);
            }
        }
    }

    /**
     * add new rule
     */
    add(t1: string, t2: string): this {
        let key = Rule.toKey(t1, t2);
        if (this._rules.hasOwnProperty(key)) {
            throw new Error("Wrong Rule definition! duplicated rule");
        } else {
            this._rules[key] = 1;
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
            return 0;
        }
    }
}

Rule.seperator = String.fromCharCode(12288);

interface Iterator<T> {
    predict(): T[]|null;
    next(choice: T): boolean;
}

export class Oritatami {
    free: number;
    _ways: (number[])[];
    rule: Rule;

    constructor(free: number, rule: Rule) {
        this.free = free;
        this.rule = rule;
        this.generatePossibleWays();
    }

    push(grid: Grid, beginPoint: Point, sequence: string): Iterator<Point> {
        const length = sequence.length;
        // prepare empty tail
        sequence.concat(" ".repeat(this.free - 1));
        let point = new Point(beginPoint);
        let i = 0;

        const predict = (): Point[]|null => {
            if (i < length) {
                const partialSeq = sequence.substr(i, this.free);
                // try all possible ways
                let mostStablePath: (number[])[] = [];
                let mostStablePower: number = 0;
                for (let path of this._ways) {
                    let pointOnPath = new Point(point);
                    let seqIndex = 0;
                    let power = 0;
                    const pushedPoints: Point[] = [];
                    for (let dir of path) {
                        pointOnPath.add(Point.directions.toArray()[dir]);
                        if (!grid.put(pointOnPath, partialSeq[seqIndex])) {
                            break;
                        }
                        pushedPoints.push(new Point(pointOnPath));
                        power += this.getPower(grid, pointOnPath);
                        seqIndex++;
                    }
                    // remove pushed points
                    for (let point of pushedPoints) {
                        grid.remove(point);
                    }
                    // path is invalid!
                    if (seqIndex !== this.free) {
                        continue;
                    } else {
                        if (mostStablePower < power) {
                            mostStablePower = power;
                            mostStablePath = [path];
                        } else if (mostStablePower === power) {
                            mostStablePath = mostStablePath.concat([path]);
                        }
                    }
                }
                if (mostStablePath === null) {
                    // wtf: not possible path?!
                    console.error("Possible path is not exists");
                    return null;
                } else {
                    // prevent duplicated...
                    const ret = [];
                    mostStablePath.forEach((v) => {
                        const newPoint = Point.added(point, Point.directions.toArray()[v[0]]);
                        if (ret.find((v) => v.x === newPoint.x && v.y === newPoint.y) == null) {
                            ret.push(newPoint);
                        }
                    });
                    return ret;
                }
            } else {
                return null;
            }
        };
        return {
            predict: predict,
            next(p: Point): boolean {
                if (i >= length) {
                    return false;
                }
                point = p;
                if (!grid.put(point, sequence[i])) {
                    return false;
                }
                i++;
                return true;
            }
        };
    }


    getPower(grid: Grid, point: Point): number {
        const adjacents = grid.getNear(point);
        let ret = 0;
        const value = adjacents.c;

        let acc = (curVal: string) => {
            if (curVal == null) {
                return;
            }
            ret += this.rule.get(curVal, value);
        };
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

        let generator = (way: number[], level: number) => {
            let idx = 0;
            let clonedWay = way.slice(0, way.length);
            for (let dir of Point.directions.toArray()) {
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