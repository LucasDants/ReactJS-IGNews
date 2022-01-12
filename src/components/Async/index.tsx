import { useEffect, useState } from "react"

export function Async() {
    const [isButtonVisibile, setIsButtonVisible] = useState(false)

    useEffect(() => {
        setTimeout(() => {setIsButtonVisible(true)}, 1000)
    }, [])

    return (
        <div>
            <div>Hello</div>
            { isButtonVisibile && <button>button</button>}
        </div>
    )
}