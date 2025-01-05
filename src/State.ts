type Coord = [col: number, row: number]

export class State {
    data
    constructor(data: (number | undefined)[][]) {
        this.data = data
    }

    get width() {
        return this.data[0].length
    }
    get height() {
        return this.data.length
    }

    swap([ax, ay]: Coord, [bx, by]: Coord) {
        
    }

    toString() {
        return this.data.map(row => row.join(""))
            .join("\n")
    }
    toBoxString() {
        return this.toString()
            .replaceAll("0", "■")
            .replaceAll("1", "□")
    }
    static fromString(str: string) {
        return new State(str
            .trim()
            .split("\n")
            .map(line => line
                .trim()
                .split("")
                .map(x => x == " "
                    ? undefined
                    : Number(x)
                )
            )
        )
    }
}

console.log(State.fromString(`
    0101
    0101
    1010
    1010
`).toBoxString())