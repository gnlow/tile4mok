import { html, render } from "https://esm.sh/lit-html@3.2.1"

const app = document.querySelector("body")!
const shadow = app.attachShadow({ mode: "open" })

render(html`
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        :host {
            padding: 30px;
            background: oklch(96% 0.02 55);
            color: oklch(30% 0.01 55)
        }
        h1 {
            font-size: 64px;
            font-weight: 700;
            letter-spacing: -0.05em;
        }
    </style>
    <h1>Tile4mok</h1>
`, shadow)
