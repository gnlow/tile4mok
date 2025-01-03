import { html } from "./deps.ts"
import { $root } from "./index.ts"

const boardState = `
    0101
    0101
    1010
    1010
`
    .trim()
    .split("\n")
    .map(line => line.trim().split("").map(Number))

export const Board = html`
<style>
    Board {
        width: 100%;
        border: 5px solid var(--black);
        padding: 5px;

        display: grid;
        grid: repeat(6, 1fr) / repeat(6, 1fr);
        grid-gap: 5px;

        border-radius: 18px;
    }
</style>
<Board>
    <style>
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
    ${boardState.flatMap((row, rowI) => row.map((state, colI) => {
        let startX = 0
        let startY = 0
        let x = 0
        let y = 0

        let $el: HTMLElement
        const onMove = (e: Event) => {
            if (!(e instanceof MouseEvent)) { throw 0 }
            $el.style.left = (x = e.pageX - startX) + "px"
            $el.style.top = (y = e.pageY - startY) + "px"
        }
        return html`<Tile
            state=${state}
            col=${colI}
            row=${rowI}
            style="
                grid-column: ${colI + 2};
                grid-row: ${rowI + 2};
            "
            @mousedown=${(e: MouseEvent) => {
                $el = e.target as HTMLElement
                startX = e.pageX - x
                startY = e.pageY - y
                $root.addEventListener("mousemove", onMove)
            }}
            @mouseup=${(e: MouseEvent) => {
                $root.removeEventListener("mousemove", onMove)
            }}
        />`
    }))}
</Board>
`