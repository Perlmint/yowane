import { Rule } from "./oritatami";

function globalDirectionToLocalDirection(direction: number, base: number): number {
    let ret = direction - base;
    if (ret < 0) {
        return ret + 6;
    }
    return ret;
}

function localDirectionToGlobalDirection(direction: number, globalBase: number): number {
    let ret = direction + globalBase
    if (ret > 5) {
        return ret - 6;
    }
    return ret;
}

export class Filler {
    delay: number;
    seed: string[];
    rule: Rule;
    _hinges: {[key:number]:string[]};

    constructor(delay: number, seed: string[], rule: Rule) {
        this.delay = delay;
        this.seed = seed;
        this.rule = rule;
    }

    setHinge(to: number, seq: string[]): Filler {
        this._hinges[to] = seq;
        return this;
    }

    predictSequences(directions: number[]) {
        let index = 1;
        let currentDirection = directions[0];
        const ret: (string[])[] = [];
        for (; index < directions.length; index++) {
            const nextDirection = directions[index];
            ret.push(this._hinges[nextDirection]);
            currentDirection = nextDirection;
        }

        return ret;
    }
}

const TriangleRule = new Rule()
.add("103", "101").add("103", "c04").add("104", "c03").add("104", "c04").add("105", "103")
.add("107", "104").add("107", "105").add("108", "104").add("109", "107").add("111", "108")
.add("111", "109").add("112", "108").add("113", "111").add("115", "113").add("115", "112")
.add("116", "c01").add("117", "115").add("117", "114").add("119", "116").add("119", "117")
.add("c01", "118").add("c01", "119").add("c02", "120").add("c03", "c01").add("c04", "118")
.add("203", "201").add("203", "c04").add("204", "c04").add("205", "203").add("207", "204")
.add("207", "205").add("208", "204").add("209", "207").add("211", "208").add("211", "209")
.add("212", "208").add("213", "c02").add("214", "212").add("215", "211").add("217", "215")
.add("217", "214").add("218", "214").add("220", "218").add("220", "217").add("c01", "216")
.add("c02", "220").add("c04", "216").add("303", "c04").add("304", "c04").add("305", "303")
.add("307", "304").add("307", "305").add("308", "304").add("309", "c03").add("310", "c02")
.add("312", "309").add("312", "310").add("313", "308").add("314", "307").add("315", "306")
.add("317", "315").add("317", "314").add("318", "313").add("320", "317").add("320", "318")
.add("c01", "316").add("c02", "320").add("c04", "316").add("403", "c04").add("404", "c04")
.add("405", "c03").add("406", "c02").add("407", "c02").add("409", "407").add("409", "406")
.add("410", "405").add("412", "410").add("412", "405").add("413", "404").add("414", "403")
.add("415", "402").add("417", "414").add("417", "415").add("418", "413").add("420", "418")
.add("420", "417").add("c01", "416").add("c02", "420").add("c04", "416").add("501", "c03")
.add("502", "c03").add("503", "c02").add("504", "c02").add("506", "504").add("506", "503")
.add("507", "503").add("509", "507").add("509", "502").add("510", "502").add("512", "510")
.add("512", "501").add("513", "501").add("514", "c04").add("517", "515").add("517", "514")
.add("518", "514").add("518", "513").add("520", "518").add("520", "517").add("c01", "516")
.add("c02", "520").add("c04", "516");

export const TriangleFiller = new Filler(4,
["117", "118", "119", "120", "c01", "c02", "c03", "c04"],
TriangleRule)
.setHinge(1, ["101", "102", "103", "104", "105", "106", "107", "108", "109", "110",
"111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "c01", "c02", "c03", "c04"])
.setHinge(2, ["201", "202", "203", "204", "205", "206", "207", "208", "209", "210",
"211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "c01", "c02", "c03", "c04"])
.setHinge(3, ["301", "302", "303", "304", "305", "306", "307", "308", "309", "310",
"311", "312", "313", "314", "315", "316", "317", "318", "319", "320", "c01", "c02", "c03", "c04"])
.setHinge(4, ["401", "402", "403", "404", "405", "406", "407", "408", "409", "410",
"411", "412", "413", "414", "415", "416", "417", "418", "419", "420", "c01", "c02", "c03", "c04"])
.setHinge(5, ["501", "502", "503", "504", "505", "506", "507", "508", "509", "510",
"511", "512", "513", "514", "515", "516", "517", "518", "519", "520", "c01", "c02", "c03", "c04"]);