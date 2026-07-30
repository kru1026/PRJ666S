// my-app/pages/api/getAllCoursesFromOneTutor.js

export async function getAllCoursesFromOneTutor(UserName) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAllCoursesFromOneTutor?userName=${UserName}`, {
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