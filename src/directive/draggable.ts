import {
    AsyncDirective,
    directive,
    PartInfo,
    type AttributePart,
    PartType,
    noChange,
} from "../deps.ts"

class Draggable extends AsyncDirective {
    constructor(partInfo: PartInfo) {
        super(partInfo)
        if (partInfo.type == PartType.CHILD) {
            console.error(new Error("Not in attr. pos."))
        }
    }
    render() {
        
    }
    override update(part: AttributePart) {
        const $el = part.element
        console.log($el)

        const scale = 1

        let x = 0
        let y = 0

        $el.addEventListener("mousedown", e => {
            e.preventDefault()

            const startPageX = e.pageX
            const startPageY = e.pageY
            const startX = x
            const startY = y

            $el.style.zIndex = "1"

            const onMove = (e: MouseEvent) => {
                const dPageX = (e.pageX - startPageX) / scale
                const dPageY = (e.pageY - startPageY) / scale
                x = startX + dPageX
                y = startY + dPageY
                $el.style.left = x+"px"
                $el.style.top = y+"px"
                this.setValue({ x, y })
            }

            addEventListener("mousemove", onMove)
            addEventListener("mouseup", () => {
                $el.style.zIndex = "0"
                removeEventListener("mousemove", onMove)
            }, { once: true })
        })
        return noChange
    }
}

export const draggable = directive(Draggable)