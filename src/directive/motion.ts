import {
    AsyncDirective,
    directive,
    PartInfo,
    type AttributePart,
    PartType,
    noChange,
} from "../deps.ts"
import { tick } from "../util.ts"

class Motion extends AsyncDirective {
    renderedX = 0
    renderedY = 0
    constructor(partInfo: PartInfo) {
        super(partInfo)
        if (partInfo.type == PartType.CHILD) {
            console.error(new Error("Not in attr. pos."))
        }
    }
    render() {
        console.log("motion init")
    }
    override update(part: AttributePart) {
        const $el = part.element
        console.log($el)

        const observer = new MutationObserver((m) => {
            console.log($el.style.left, $el.style.top)
            $el.style.left += 100
        })
        observer.observe($el, {
            attributeFilter: ["style"],
            attributeOldValue: true,
        })

        console.log(part.options)

        const x = Number($el.getAttribute("x"))
        const y = Number($el.getAttribute("x"))

        if (!x || !y) return noChange

        ;(async () => {
            while (Math.hypot(x - this.renderedX, y - this.renderedY)) {
                await tick()

                this.renderedX = (x - this.renderedX) * 0.1
                this.renderedY = (y - this.renderedY) * 0.1

                $el.style.left = this.renderedX + "px"
                $el.style.top = this.renderedY + "px"
            }
        })()

        return noChange
    }
}

export const motion = directive(Motion)