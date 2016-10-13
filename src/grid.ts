/*
Coordinate System
   Y axis
       /
      /
     /
____/______ X axis

Delta from center

   1 - lu(-1, 1) (0, 1)u - 2
0 - l(-1, 0) (0, 0) (1, 0)r - 3
    5 - d(0, -1) (1, -1)rd - 4
*/

interface AdjacentPoints {
    l: Point;
    lu: Point;
    u: Point;
    c: Point;
    r: Point;
    rd: Point;
    d: Point;
}

export class Point {
    x: number;
    y: number;

    static directions: {
        toArray(): Point[];
    } & AdjacentPoints;

    constructor(p: Point);
    constructor(x?: number, y?: number);
    constructor(arg1?: number | Point, y?: number) {
        if (arg1 == null) {
            return;
        } else {
            if (typeof arg1 === "number") {
                this.x = arg1;
            } else {
                this.x = arg1.x;
                this.y = arg1.y;
                return;
            }
        }
        if (y == null) {
            return;
        } else {
            this.y = y;
        }
    }

    static added(point1: Point, point2: Point): Point {
        return (new Point(point1)).add(point2);
    }

    add(point: Point): this {
        this.x += point.x;
        this.y += point.y;
        return this;
    }

    sub(point: Point): this {
        this.x -= point.x;
        this.y -= point.y;
        return this;
    }

    toString(): string {
        return `Point(${this.x}, ${this.y})`;
    }
}

const directions = [
    new Point(-1, 0), // l
    new Point(-1, 1), // lu
    new Point(0, 1),  // u
    new Point(1, 0),  // r
    new Point(1, -1), // rd
    new Point(0, -1)  // d
];

Point.directions = {
    toArray: () => directions,
    l: directions[0],
    lu: directions[1],
    u: directions[2],
    c: new Point(0, 0),
    r: directions[3],
    rd: directions[4],
    d: directions[5]
};

export class AdjacentGrid {
    l: string;
    lu: string;
    u: string;
    c: string;
    r: string;
    rd: string;
    d: string;
};

export class Grid {
    _data: { [key: string]: string };

    constructor() {
        this._data = {};
    }

    static toKey(point: Point): string {
        return `${point.x}:${point.y}`;
    }

    static parseKey(str: string): Point {
        let reg = /^(-?\d+):(-?\d+)$/;
        let result = reg.exec(str);
        if (result === null) {
            return null;
        }

        let pt = new Point();
        pt.x = parseInt(result[1]);
        pt.y = parseInt(result[2]);

        return pt;
    }


    put(point: Point, value: string): boolean {
        let key = Grid.toKey(point);
        if (this._data.hasOwnProperty(key)) {
            return false;
        } else {
            this._data[key] = value;
            return true;
        }
    }

    remove(point: Point): boolean {
        let key = Grid.toKey(point);
        if (this._data.hasOwnProperty(key)) {
            delete this._data[key];
            return true;
        } else {
            return false;
        }
    }

    get(point: Point): string {
        let key = Grid.toKey(point);
        if (this._data.hasOwnProperty(key)) {
            return this._data[key];
        } else {
            return null;
        }
    }

    getNear(point: Point): AdjacentGrid {
        let ret = new AdjacentGrid();

        let values: (string)[] = new Array(7);
        let idx = 0;
        for (let delta of Point.directions.toArray()) {
            let newPoint = new Point(point.x + delta.x, point.y + delta.y);
            values[idx] = this.get(newPoint);
            idx++;
        }
        ret.l = values[0];
        ret.lu = values[1];
        ret.u = values[2];
        ret.r = values[3];
        ret.rd = values[4];
        ret.d = values[5];
        ret.c = this.get(point);

        return ret;
    }

    getAll(): Array<[Point, string]> {
        let copy: Array<[Point, string]> = Array<[Point, string]>();

        for (let i in this._data) {
            let pt = Grid.parseKey(i);
            if (pt !== null) {
                copy.push([pt, this._data[i]]);
            }
        }

        return copy;
    }
}