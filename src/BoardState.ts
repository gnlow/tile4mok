type State = 0 | 1
type Vec2 = [number, number]

export class Tile {
    state
    col
    row
    constructor(state: State, [col, row]: Vec2) {
        this.state = state
        this.col = col
        this.row = row
    }
    get key() {
        return this.col + "," + this.row
    }
}

export interface Dimension {
    col: Vec2
    row: Vec2
}

export class BoardState {
    readonly tiles: Tile[] = []
    private map: Map<string, Tile> = new Map

    constructor(data: (State | undefined)[][]) {
        data.forEach((items, row) =>
            items.forEach((state, col) => {
                if (state != undefined) {
                    const tile = new Tile(state, [col, row])
                    this.tiles.push(tile)
                    this.put(tile)
                }
            })
        )
    }

    private _dimension?: Dimension

    get dimension() {
        return this._dimension ||= this.tiles.reduce(
            (prev, curr) => ({
                col: [
                    Math.min(prev.col[0], curr.col),
                    Math.max(prev.col[1], curr.col),
                ],
                row: [
                    Math.min(prev.row[0], curr.row),
                    Math.max(prev.row[1], curr.row),
                ],
            }),
            {
                col: [Infinity, -Infinity],
                row: [Infinity, -Infinity],
            }
        )
    }
    get width() {
        return this.dimension.col[1] - this.dimension.col[0] + 1
    }
    get height() {
        return this.dimension.row[1] - this.dimension.row[0] + 1
    }

    at(col: number, row: number) {
        return this.map.get(col + "," + row)
    }
    iat(colI: number, rowI: number) {
        return this.at(
            colI + this.dimension.col[0],
            rowI + this.dimension.row[0],
        )
    }

    private put(tile: Tile) {
        this.map.set(tile.key, tile)
        this._dimension = undefined
    }

    swap([ax, ay]: Vec2, [bx, by]: Vec2) {
        const tile = this.at(ax, ay)!
        this.map.delete(tile.key)
        tile.col = bx
        tile.row = by
        this.put(tile)
    }

    toString() {
        return Array.from({ length: this.height }, (_, rowI) =>
            Array.from({ length: this.width }, (_, colI) =>
                this.iat(colI, rowI)?.state ?? " "
            ).join("")
        ).join("\n")
    }
    toBoxString() {
        return this.toString()
            .replaceAll("0", "■")
            .replaceAll("1", "□")
    }
    static fromString(str: string) {
        return new BoardState(str
            .trim()
            .split("\n")
            .map(line => line
                .trim()
                .split("")
                .map(x => x == " "
                    ? undefined
                    : Number(x) as State
                )
            )
        )
    }
}
