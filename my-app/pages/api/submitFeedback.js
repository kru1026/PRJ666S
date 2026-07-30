//my-app/pages/api/submitFeedback.js

export async function submitFeedback(feedbackData) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submitFeedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to submit feedback');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}
