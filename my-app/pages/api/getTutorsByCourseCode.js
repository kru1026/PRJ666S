export async function getTutorsByCourseCode(userId, selectedCourse) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getTutorsByCourseCode?userId=${userId}&selectedCourse=${selectedCourse}`, {
            method: 'GET',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to fetch tutors");
        }

        const data = await res.json();

        return data;
    } catch (error) {
        console.error("Error fetching tutors:", error);
        throw error; 
    }
}