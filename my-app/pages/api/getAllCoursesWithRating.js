export async function getAllCoursesWithRating() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAllCoursesWithRating`, {
            method: 'GET',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to fetch courses");
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching courses:", error);
        throw error; 
    }
}