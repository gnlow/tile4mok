import { html } from "./deps.ts"
import { $root } from "./index.ts"
import { tick } from "./util.ts"

const boardState = `
    0101
    0101
    1010
    1010
`
    .trim()
    .split("\n")
    .map(line => line.trim().split("").map(Number))

export const Board = () => {

const state = boardState

const width = 4
const height = 4

let boardStartX = 0
let boardStartY = 0
let boardX = 0
let boardY = 0
let boardRenderedX = 0
let boardRenderedY = 0

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
        border: 2px solid var(--black);

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
    ${state.flatMap((row, rowI) => row.map((state, colI) => {
        let startPageX = 0
        let startPageY = 0
        let startX = 0
        let startY = 0
        let x = (colI + 1) * 140
        let y = (rowI + 1) * 140
        let renderedX = x
        let renderedY = y
        let moving = false

        const stair =
        (a: number, b: number) =>
        (n: number) =>
            Math.max(Math.min(n-a, 0), n-b)

        let $el: HTMLElement
        const onMove = (e: Event) => {
            if (!(e instanceof MouseEvent)) { throw 0 }
            const dPageX = e.pageX - startPageX
            const dPageY = e.pageY - startPageY
            boardX = stair(140, 560)(x) * -0.5
            boardY = stair(140, 560)(y) * -0.5
            const dBoardX = boardX - boardStartX
            const dBoardY = boardY - boardStartY
            x = startX + dPageX - dBoardX
            y = startY + dPageY - dBoardY
        }
        return html`<Tile
            state=${state}
            col=${colI}
            row=${rowI}
            style="
                left: ${x}px;
                top: ${y}px;
            "
            @mousedown=${async (e: MouseEvent) => {
                console.log("mousedown", x, y)
                console.log("dimension", width, height)
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
                }, { once: true })
                moving = true

                while (moving || Math.hypot(x - renderedX, y - renderedY) > 0.01) {
                    await tick()
                    $el.style.left = (renderedX += (Math.round(x / 140) * 140 - renderedX) * 0.2) + "px"
                    $el.style.top = (renderedY += (Math.round(y / 140) * 140 - renderedY) * 0.2) + "px"
                    $el.innerText = renderedX.toFixed(1) + ", " + renderedY.toFixed(1)
                    $board.style.left = (boardRenderedX += (Math.round(boardX / 70) * 70 - boardRenderedX) * 0.2) + "px"
                    $board.style.top = (boardRenderedY += (Math.round(boardY / 70) * 70 - boardRenderedY) * 0.2) + "px"
                }
            }}
        />`
    }))}
</BoardIn>
</BoardOut>
`
}