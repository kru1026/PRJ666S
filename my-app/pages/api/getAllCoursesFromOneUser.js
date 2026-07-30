// my-app/pages/api/getAllCoursesFromOneUser.js

export async function getAllCoursesFromOneUser(userName) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAllCoursesFromOneUser?userName=${userName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
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
