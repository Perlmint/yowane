// @flow
import { Grid, Point, Seeds } from "./grid";

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
    grid: Grid;
}

export interface OritatamiConfig {
    delay: number,
    rule: RuleConfig,
    seed: Seeds,
    sequence: string
}

export class Oritatami {
    delay: number;
    _paths: (number[])[];
    rule: Rule;
    static _pathSet: {[key:number]:(number[])[]} = {};

    static run(config: OritatamiConfig) {
        const oritatami = new Oritatami(config.delay, new Rule(config.rule));
        const grid = new Grid(config.seed);
        const lastSeed = config.seed[config.seed.length - 1];
        return oritatami.push(grid, new Point(lastSeed[0], lastSeed[1]), config.sequence);
    }

    constructor(delay: number, rule: Rule) {
        this.delay = delay;
        this.rule = rule;
        this.setPaths();
    }

    push(grid: Grid, beginPoint: Point, sequence: string): Iterator<Point> {
        const length = sequence.length;
        // prepare empty tail
        sequence.concat(" ".repeat(this.delay - 1));
        let point = new Point(beginPoint);
        let i = 0;

        const predict = (): Point[]|null => {
            if (i < length) {
                const partialSeq = sequence.substr(i, this.delay);
                // try all possible ways
                let mostStablePath: (number[])[] = [];
                let mostStablePower: number = 0;
                for (let path of this._paths) {
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
                    if (seqIndex !== this.delay) {
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
            },
            grid
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

    setPaths() {
        if (Oritatami._pathSet[this.delay] == null) {
            Oritatami.generatePossiblePaths(this.delay);
        }
        this._paths = Oritatami._pathSet[this.delay];
    }

    static generatePossiblePaths(delay: number) {
        let paths = [];

        let temporalGrid: Grid = new Grid();
        let point: Point = new Point(0, 0);
        temporalGrid.put(point, "");

        let generator = (path: number[], level: number) => {
            let idx = 0;
            let clonedPath = path.slice(0, path.length);
            for (let dir of Point.directions.toArray()) {
                point.add(dir);
                if (temporalGrid.put(point, "")) {
                    clonedPath.push(idx);
                    if (level > 1) {
                        generator(clonedPath, level - 1);
                    } else {
                        paths.push(clonedPath.slice(0, clonedPath.length));
                    }
                    clonedPath.pop();
                    temporalGrid.remove(point);
                }
                idx++;
                point.sub(dir);
            }
        };
        generator([], delay);
        Oritatami._pathSet[delay] = paths;
        return paths;
    }
}