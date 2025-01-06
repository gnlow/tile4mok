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
            const [x0, x1] = boardState.dimension.col
            const [y0, y1] = boardState.dimension.row

            const tempState = boardState.clone().swap(
                [tile.col, tile.row],
                [Math.round(x / boardUnit), Math.round(y / boardUnit)],
            )
            const [nx0, nx1] = tempState.dimension.col
            const [ny0, ny1] = tempState.dimension.row

            updateScale(tempState)

            boardX = snap(boardUnit/2)(stair(x0-1, nx0, nx1, x1+1)(x/boardUnit)*boardUnit * -0.5) - ((nx0+nx1)/2 - 1.5)*boardUnit
            boardY = snap(boardUnit/2)(stair(y0-1, ny0, ny1, y1+1)(y/boardUnit)*boardUnit * -0.5) - ((ny0+ny1)/2 - 1.5)*boardUnit

            const dBoardX = boardX - boardStartX
            const dBoardY = boardY - boardStartY
            x = clip((x0-1)*boardUnit, snap(boardUnit)(startX + dPageX - dBoardX), (x1+1)*boardUnit)
            y = clip((y0-1)*boardUnit, snap(boardUnit)(startY + dPageY - dBoardY), (y1+1)*boardUnit)
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