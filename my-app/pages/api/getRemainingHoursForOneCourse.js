// my-app/pages/api/getRemainingHoursForOneCourse.js

export async function getRemainingHoursForOneCourse(userName, selectedCourse, selectedTutor) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getRemainingHoursForOneCourse?userName=${userName}&selectedCourse=${encodeURIComponent(selectedCourse)}&selectedTutor=${encodeURIComponent(selectedTutor)}`, {
            method: 'GET',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to fetch remaining hours");
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching remaining hours:", error);
        throw error; 
    }
}
