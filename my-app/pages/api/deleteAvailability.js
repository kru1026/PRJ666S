export async function deleteAvailability(id) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deleteOneAvailability?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json', 
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to delete availability");
        }

        const data = await res.json(); 
        return data; 
    } catch (error) {
        console.error("Error deleting appointment:", error);
        throw error; 
    }
}