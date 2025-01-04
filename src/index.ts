import { html, render } from "./deps.ts"
import { Board } from "./board.ts"

const app = document.querySelector("body")!
export const $root = app.attachShadow({ mode: "open" })

render(html`
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        :host {
            padding: 30px;
            background: var(--white);
            color: var(--black);
            display: flex;
            flex-direction: column;
            --black: oklch(30% 0.01 55);
            --white: oklch(96% 0.01 55);
        }
        h1 {
            font-size: 64px;
            font-weight: 700;
            letter-spacing: -0.05em;
            color: var(--black);
        }
    </style>
    <h1>Drag Demo</h1>
    ${Board()}
`, $root)
