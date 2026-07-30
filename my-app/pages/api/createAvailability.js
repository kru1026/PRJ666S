export async function createAvailability(userId, startTime, endTime) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/createAvailability`, {
        method: 'PUT',
        body: JSON.stringify({ 
            _id: userId, // userId should be a string directly
            availability: { // Ensure availability is an object
                startTime: startTime, 
                endTime: endTime 
            } 
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    const data = await res.json();
    
    if (res.status === 200) {
        return true; // Return a success indicator
    } else {
        throw new Error(data.message); // Throw error with message from server
    }
}
