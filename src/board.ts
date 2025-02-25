import { html, render as litRender, map } from "./deps.ts"
import { $root } from "./index.ts"
import { tick } from "./util.ts"
import { BoardState, Tiley } from "./BoardState.ts"

export const Board = () => {

const boardState = BoardState.fromString(`
    0101
    0101
    1010
    1010
`)

let boardStartX = 0
let boardStartY = 0
let boardX = 0
let boardY = 0
let boardRenderedX = 0
let boardRenderedY = 0
const boardUnit = 140
let scale = 1
let renderedScale = scale

const updateScale = (boardState: BoardState) => {
    const $boardOut = $root.querySelector("BoardOut")! as HTMLElement
    const boardWidth = $boardOut.clientWidth
    const boardHeight = $boardOut.clientHeight
    
    scale = Math.min(
        boardWidth/(boardState.width+2),
        boardHeight/(boardState.height+2),
    ) / boardUnit
}
addEventListener("DOMContentLoaded", () => updateScale(boardState))
addEventListener("resize", async () => {
    await tick()
    updateScale(boardState)
})

const getClosestCandid =
(candids: Tiley[]) =>
(x: number, y: number): Tiley => {
    return candids
        .map(({ col, row }) => ({ col, row, len: Math.hypot(col-x, row-y)}))
        .toSorted((a, b) => a.len - b.len)
        [0] || { col: x, row: y }
}

return html`
<style>
    BoardOut {
        width: 100%;
        height: 100%;
        border: 5px solid var(--black);
        padding: 5px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 18px;

        overflow: hidden;
    }
    BoardIn {
        position: relative;
        width: 555px;
        height: 555px;

        border-radius: 11px;
    }
    Tile, Circle {
        display: block;
        position: absolute;
        aspect-ratio: 1;
    }
    Tile {
        width: 135px;
        border-radius: 8px;
    }
    Circle {
        width: 30px;
        border-radius: 15px;
        z-index: -1;
    }
    Circle[isOrigin="true"] {
        border-radius: 0;
        transform: rotate(45deg) scale(0.85);
    }
    :is(Tile, Circle)[state="0"] {
        background: var(--black);
        
        color: var(--white);
    }
    :is(Tile, Circle)[state="1"] {
        background: var(--white);
        border: 5px solid var(--black);

        color: var(--black);
    }
</style>
<BoardOut>
<BoardIn>
    ${boardState.tiles.map((tile, i) => {
        const { state, col, row } = tile
        let startPageX = 0
        let startPageY = 0
        let startX = 0
        let startY = 0
        let x = col * boardUnit
        let y = row * boardUnit
        let renderedX = x
        let renderedY = y
        let moving = false
        let candids: Tiley[] = []

        let $el: HTMLElement

        const render = ($el: HTMLElement, $board: HTMLElement) => {
            $el.style.left = (renderedX += (x - renderedX) * 0.1) + "px"
            $el.style.top = (renderedY += (y - renderedY) * 0.1) + "px"
            
            $board.style.transform = `scale(${renderedScale += (scale - renderedScale) * 0.1})`
            $board.style.left = (boardRenderedX += (boardX - boardRenderedX) * 0.1) * renderedScale + "px"
            $board.style.top = (boardRenderedY += (boardY - boardRenderedY) * 0.1) * renderedScale + "px"
        }
        addEventListener("DOMContentLoaded", () => {
            render(
                $root.querySelector(`tile:nth-child(${i+1})`)!,
                $root.querySelector("boardin")!,
            )
        })
        addEventListener("resize", async () => {
            await tick()
            render(
                $root.querySelector(`tile:nth-child(${i+1})`)!,
                $root.querySelector("boardin")!,
            )
        })
        const onMove = (e: Event) => {
            if (!(e instanceof MouseEvent)) { throw 0 }
            const dPageX = (e.pageX - startPageX) / scale
            const dPageY = (e.pageY - startPageY) / scale

            const tempState = boardState.clone().swap(
                [tile.col, tile.row],
                [Math.round(x / boardUnit), Math.round(y / boardUnit)],
            )
            const [nx0, nx1] = tempState.dimension.col
            const [ny0, ny1] = tempState.dimension.row

            updateScale(tempState)

            boardX = -((nx0+nx1)/2 - 1.5)*boardUnit
            boardY = -((ny0+ny1)/2 - 1.5)*boardUnit

            const dBoardX = boardX - boardStartX
            const dBoardY = boardY - boardStartY

            const closest = getClosestCandid(candids)(
                (startX + dPageX - dBoardX) / boardUnit,
                (startY + dPageY - dBoardY) / boardUnit,
            )

            x = closest.col * boardUnit
            y = closest.row * boardUnit
        }
        return html`<Tile
            state=${state}
            style="
                left: ${x}px;
                top: ${y}px;
            "
            @mousedown=${async (e: MouseEvent) => {
                e.preventDefault()
                console.log("mousedown", x, y)
                console.log("dimension", boardState.width, boardState.height)
                const $board = $root.querySelector("BoardIn")! as HTMLElement
                $el = e.target as HTMLElement
                startPageX = e.pageX
                startPageY = e.pageY
                startX = x
                startY = y
                boardStartX = boardX
                boardStartY = boardY
                candids = boardState.getCandids(tile.col, tile.row)
                litRender(html`
                    ${map(candids, ({ col, row }) => html`
                        <Circle
                            state=${tile.state}
                            isOrigin=${tile.col == col && tile.row == row}
                            style="
                                left: ${ (col + 0.5) * boardUnit - 15 }px;
                                top:  ${ (row + 0.5) * boardUnit - 15 }px;
                            "
                        />
                    `)}
                `, $board)
                $root.addEventListener("mousemove", onMove)
                $root.addEventListener("mouseup", () => {
                    console.log("mouseup", x, y)
                    litRender(html``, $board)
                    $root.removeEventListener("mousemove", onMove)
                    moving = false
                    $el.style.zIndex = "0"
                    boardState.swap(
                        [tile.col, tile.row],
                        [Math.round(x / boardUnit), Math.round(y / boardUnit)],
                    )
                    console.log(boardState.toBoxString())
                    console.log(boardState.getCandids(Math.round(x / boardUnit), Math.round(y / boardUnit)))
                }, { once: true })
                moving = true

                $el.style.zIndex = "1"

                while (moving || Math.hypot(x - renderedX, y - renderedY) > 0.01) {
                    await tick()
                    render($el, $board)
                }
            }}
        />`
    })}
</BoardIn>
</BoardOut>
`
}