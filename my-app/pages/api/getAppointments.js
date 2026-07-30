// my-app/pages/api/getAppointmentsFromOneUser.js

export async function getAppointmentsForUser(UserName) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAppointmentsForUser?userName=${UserName}`, {
            method: 'GET',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to fetch appointments");
        }

        const data = await res.json();

        return data;
    } catch (error) {
        console.error("Error fetching appointments:", error);
        throw error; 
    }
}