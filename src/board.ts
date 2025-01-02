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
        border: 1px solid black;

        display: grid;
        grid: repeat(5, 1fr) / repeat(5, 1fr);
    }
</style>
<Board>
    <style>
        Tile {
            display: block;
            width: 100%;
            height: 100%;
            aspect-ratio: 1;
        }
        Tile[state="0"] {
            background: var(--black);
        }
        Tile[state="1"] {
            background: var(--white);
        }
    </style>
    ${boardState.flatMap(row => row.map(state => html`<Tile
        state="${state}"
    />`))}
</Board>
`