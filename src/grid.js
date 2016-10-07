// @flow

/*
Direction  
  2      u
1   3  lu ru 
  0      c
6   4  ld rd
  5      d

Coordinate System
X axis   Y axis
\      /
 \    /
  \  /
   \/

Delta from 0
       (-1,  1)
(-1,  0)      ( 0,  1)
       ( 0,  0)
( 0, -1)      ( 1,  0)
       ( 1,  -1)
*/

export class Point {
    x: number;
    y: number;

    static directions: this[];

    constructor(x: ?number, y: ?number) {
        if (x == null) {
            return;
        } else {
            this.x = x;
        }
        if (y == null) {
            return;
        } else {
            this.y = y;
        }
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

Point.directions = [
    new Point(-1, 0),
    new Point(-1, 1),
    new Point(0, 1),
    new Point(1, 0),
    new Point(1, -1),
    new Point(0, -1)
];

export class AdjacentGrid {
    lu: ?string;
    u: ?string;
    ru: ?string;
    c: ?string;
    ld: ?string;
    rd: ?string;
    d: ?string;
}

export class Grid {
    _data: {[key:string]:string};

    constructor() {
        this._data = {};
    }

    static toKey(point: Point): string {
        return `${point.x}:${point.y}`;
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

    get(point: Point): ?string {
        let key = Grid.toKey(point);
        if (this._data.hasOwnProperty(key)) {
            return this._data[key];
        } else {
            return null;
        }
    }

    getNear(point: Point): AdjacentGrid {
        let ret = new AdjacentGrid();

        let values: (?string)[] = new Array(7);
        let idx = 0;
        for(let delta of [[-1, 1], [-1, 0], [0, 1], [0, 0],
                           [0, -1], [1, 0], [1, -1]]) {
            let newPoint = new Point(point.x + delta[0], point.y + delta[1]);
            values[idx] = this.get(newPoint);
            idx++;
        }

        ret.u = values[0];
        ret.lu = values[1];
        ret.ru = values[2];
        ret.c = values[3];
        ret.ld = values[4];
        ret.rd = values[5];
        ret.d = values[6];

        return ret;
    }
}