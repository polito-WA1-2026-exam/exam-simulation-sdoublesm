async function getCourses() {
    try {
        const response = await fetch('http://localhost:3001/api/courses')

        if (response.ok) {
            const coursesList = await response.json()
            return coursesList
        } else {
            // 4xx or 5xx status code
            throw new Error('HTTP error in getCourses, code=' + response.status)
        }
    } catch (ex) {
        // handle network errors + parsing errors
        throw new Error("Network error", { cause: ex })
    }
}


export {getCourses}