export async function updateRemainingHours(userId, courseCode, selectedTutor, remainingHours) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/updateRemainingHours`, {
            method: 'PUT',
            body: JSON.stringify({ _id: userId, courseCode: courseCode, taughtBy: selectedTutor, remainingHours: remainingHours }),
            headers: {
              'content-type': 'application/json',
            },
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