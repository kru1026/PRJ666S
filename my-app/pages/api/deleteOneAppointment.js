// my-app/pages/api/deleteOneAppointment.js

export async function deleteOneAppointment(appointmentId) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deleteOneAppointment/${appointmentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json', // Optional: If you need to specify the content type
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to delete appointment");
        }

        const data = await res.json(); // Assuming your server returns data after deletion
        return data; // Return the response data
    } catch (error) {
        console.error("Error deleting appointment:", error);
        throw error; 
    }
}
