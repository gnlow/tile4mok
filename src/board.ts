import { html } from "./deps.ts"

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

        border-radius: 15px;
    }
</style>
<Board>
    <style>
        Tile {
            display: block;
            width: 100%;
            height: 100%;
            aspect-ratio: 1;

            border-radius: 5px;
        }
        Tile[state="0"] {
            background: var(--black);
        }
        Tile[state="1"] {
            background: var(--white);
        }
    </style>
    ${boardState.flatMap((row, rowI) => row.map((state, colI) => html`<Tile
        state="${state}"
        col="${colI}"
        row="${rowI}"
        style="
            grid-column: ${colI + 2};
            grid-row: ${rowI + 2};
        "
    />`))}
</Board>
`