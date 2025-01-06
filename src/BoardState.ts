type State = 0 | 1
type Vec2 = [number, number]

const getKey = ({ col, row }: { col: number, row: number }) => {
    return col + "," + row
}
const unKey = (str: string): Tiley => {
    const [ col, row ] = str.split(",").map(Number)
    return { col, row }
}

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
        return getKey(this)
    }
    clone() {
        return new Tile(this.state, [this.col, this.row])
    }
}

export interface Dimension {
    col: Vec2
    row: Vec2
}

interface Tiley { col: number, row: number }

class BoardProto<Tile extends Tiley> {
    readonly tiles
    private map = new Map<string, Tile>

    constructor(
        tiles: Tile[]
    ) {
        this.tiles = tiles
        this.tiles.forEach(tile => this.put(tile))
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

    delete(tile: Tile) {
        this.map.delete(getKey(tile))
        this._dimension = undefined
        return this
    }
    put(tile: Tile) {
        this.map.set(getKey(tile), tile)
        this._dimension = undefined
    }

    swap([ax, ay]: Vec2, [bx, by]: Vec2) {
        const tile = this.at(ax, ay)!
        this.delete(tile)
        tile.col = bx
        tile.row = by
        this.put(tile)
        return this
    }
    clone() {
        return new BoardProto(
            this.tiles.map(tile => structuredClone(tile))
        )
    }
}

const d = [[0,-1],[1,0],[0,1],[-1,0]]

export class BoardState extends BoardProto<Tile> {
    cut(x0: number, y0: number) {

        const flood = (x1: number, y1: number) => {
            console.log("flood", x1, y1)
            const out = []
            const q = [this.at(x1, y1)]
            const sketchBook = new BoardProto<Tiley>([])
            sketchBook.put({ col: x0, row: y0 })
            sketchBook.put({ col: x1, row: y1 })
            while (q.length) {
                const now = q.pop()
                if (!now) return []
                x1 = now.col
                y1 = now.row
                
                console.log("flood>>", now, q.length)
                
                out.push(now)

                q.push(...d
                    .map(([x, y]) => {
                        const tile = this.at(x1+x, y1+y)
                        if (sketchBook.at(x1+x, y1+y)) {
                            console.log("cut", x1+x, y1+y)
                            return
                        } else {
                            sketchBook.put({ col: x1+x, row: y1+y })
                            console.log("put", x1+x, y1+y)
                            return tile
                        }
                    })
                    .filter(t => t)
                )
            }
            return out
        }
        
        return d
            .map(([x, y]) => flood(x0+x, y0+y))
            .filter(l => l.length)
    }
    getCandids(x0: number, y0: number) {
        const res = this.cut(x0, y0)
            .map(l => {
                const base = new Set(l.map(getKey))
                const offset = new Set(l.flatMap(t =>
                    d.map(([x, y]) => (getKey({ col: t.col+x, row: t.row+y })))
                ))
                return offset.difference(base)
            })
            .reduce((a, b) => a.intersection(b))
        res.delete(getKey({ col: x0, row: y0 }))
        return [...res]
            .map(unKey)
    }

    override clone() {
        return new BoardState(
            this.tiles.map(tile => tile.clone())
        )
    }
    override toString() {
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
    static fromTable(data: (State | undefined)[][]) {
        const tiles: Tile[] = []
        data.forEach((items, row) =>
            items.forEach((state, col) => {
                if (state != undefined) {
                    const tile = new Tile(state, [col, row])
                    tiles.push(tile)
                }
            })
        )
        return new BoardState(tiles)
    }
    static fromString(str: string) {
        return BoardState.fromTable(str
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