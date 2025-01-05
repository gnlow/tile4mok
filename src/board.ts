import { html } from "./deps.ts"
import { $root } from "./index.ts"
import { tick } from "./util.ts"
import { BoardState } from "./BoardState.ts"

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

return html`
<style>
    BoardOut {
        width: 100%;
        border: 5px solid var(--black);
        padding: 5px;

        border-radius: 18px;

        overflow: hidden;
    }
    BoardIn {
        position: relative;
        width: 100%;

        border-radius: 11px;

        display: grid;
        grid: repeat(6, 135px) / repeat(6, 135px);
        grid-gap: 5px;
    }
    Tile {
        display: block;
        position: absolute;
        width: 135px;
        height: 135px;
        aspect-ratio: 1;

        border-radius: 8px;
    }
    Tile[state="0"] {
        background: var(--black);
        
        color: var(--white);
    }
    Tile[state="1"] {
        background: var(--white);
        border: 5px solid var(--black);

        color: var(--black);
    }
</style>
<BoardOut>
<BoardIn>
    ${boardState.tiles.map(tile => {
        const { state, col, row } = tile
        let startPageX = 0
        let startPageY = 0
        let startX = 0
        let startY = 0
        let x = (col + 1) * boardUnit
        let y = (row + 1) * boardUnit
        let renderedX = x
        let renderedY = y
        let moving = false

        const clip =
        (a: number, b: number, c: number) =>
            Math.max(a, Math.min(b, c))

        const stair =
        (a: number, b: number, c: number, d: number) =>
        (n: number) =>
            clip(a-b, clip(n-c, 0, n-b), d-c)
        
        const snap =
        (step: number) =>
        (n: number) =>
            Math.round(n / step) * step

        let $el: HTMLElement
        const onMove = (e: Event) => {
            if (!(e instanceof MouseEvent)) { throw 0 }
            const dPageX = (e.pageX - startPageX) / scale
            const dPageY = (e.pageY - startPageY) / scale
            const [x0, x1] = boardState.dimension.col
            const [y0, y1] = boardState.dimension.row

            const $boardOut = $root.querySelector("BoardOut")! as HTMLElement
            const boardWidth = $boardOut.clientWidth
            const boardHeight = $boardOut.clientHeight
            
            scale = Math.min(
                boardWidth/(boardState.width+2),
                boardHeight/(boardState.height+2),
            ) / boardUnit

            boardX = snap(boardUnit/2)(stair(x0, x0+1, x1+1, x1+2)(x/boardUnit)*boardUnit * -0.5) - ((x0+x1)/2 - 1.5)*boardUnit
            boardY = snap(boardUnit/2)(stair(y0, y0+1, y1+1, y1+2)(y/boardUnit)*boardUnit * -0.5) - ((y0+y1)/2 - 1.5)*boardUnit

            const dBoardX = boardX - boardStartX
            const dBoardY = boardY - boardStartY
            x = clip(x0*boardUnit, snap(boardUnit)(startX + dPageX - dBoardX), (x1+2)*boardUnit)
            y = clip(y0*boardUnit, snap(boardUnit)(startY + dPageY - dBoardY), (y1+2)*boardUnit)
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
                $root.addEventListener("mousemove", onMove)
                $root.addEventListener("mouseup", () => {
                    console.log("mouseup", x, y)
                    $root.removeEventListener("mousemove", onMove)
                    moving = false
                    $el.style.zIndex = "0"
                    boardState.swap(
                        [tile.col, tile.row],
                        [Math.round(x / boardUnit)-1, Math.round(y / boardUnit)-1],
                    )
                    console.log(boardState.toBoxString())
                }, { once: true })
                moving = true

                $el.style.zIndex = "1"

                while (moving || Math.hypot(x - renderedX, y - renderedY) > 0.01) {
                    await tick()
                    $el.style.left = (renderedX += (x - renderedX) * 0.1) + "px"
                    $el.style.top = (renderedY += (y - renderedY) * 0.1) + "px"
                    $board.style.left = (boardRenderedX += (boardX - boardRenderedX) * 0.1) + "px"
                    $board.style.top = (boardRenderedY += (boardY - boardRenderedY) * 0.1) + "px"
                    $board.style.transform = `scale(${renderedScale += (scale - renderedScale) * 0.1})`
                }
            }}
        />`
    })}
</BoardIn>
</BoardOut>
`
}