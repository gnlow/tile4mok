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

        display: grid;
        grid: repeat(6, 1fr) / repeat(6, 1fr);
        grid-gap: 5px;
    }
    Tile {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        aspect-ratio: 1;

        border-radius: 8px;
    }
    Tile[state="0"] {
        background: var(--black);
    }
    Tile[state="1"] {
        background: var(--white);
        border: 5px solid var(--black);
    }
</style>
<BoardOut>
<BoardIn>
    <style>
    </style>
    ${boardState.flatMap((row, rowI) => row.map((state, colI) => {
        let startX = 0
        let startY = 0
        let x = 0
        let y = 0
        let renderedX = 0
        let renderedY = 0
        let moving = false

        let $el: HTMLElement
        const onMove = (e: Event) => {
            if (!(e instanceof MouseEvent)) { throw 0 }
            x = e.pageX - startX
            y = e.pageY - startY
        }
        return html`<Tile
            state=${state}
            col=${colI}
            row=${rowI}
            style="
                grid-column: ${colI + 2};
                grid-row: ${rowI + 2};
            "
            @mousedown=${async (e: MouseEvent) => {
                const $board = $root.querySelector("BoardIn")! as HTMLElement
                $el = e.target as HTMLElement
                startX = e.pageX - x
                startY = e.pageY - y
                $root.addEventListener("mousemove", onMove)
                $root.addEventListener("mouseup", () => {
                    $root.removeEventListener("mousemove", onMove)
                    moving = false
                })
                moving = true

                while (moving || Math.hypot(x - renderedX, y - renderedY) > 0.01) {
                    await tick()
                    $el.style.left = (renderedX += (x - renderedX) * 0.2) * 1.5 + "px"
                    $el.style.top = (renderedY += (y - renderedY) * 0.2) * 1.5 + "px"
                    $board.style.left = -renderedX * 0.5 + "px"
                    $board.style.top = -renderedY * 0.5 + "px"
                }
            }}
        />`
    }))}
</BoardIn>
</BoardOut>
`
}