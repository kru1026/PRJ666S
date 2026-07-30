// my-app/pages/api/course.js

export async function createCourse(newCourseData) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCourseData),  

    });

    // Check if the response is not OK
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create course");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

export async function updateCourse(courseId, updatedCourseData) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCourseData),
    });

    // Check if the response is not OK
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update course");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

export async function addTutorToCourse(courseId, tutorId) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/tutors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tutorId }),
    });

    // Check if the response is not OK
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add tutor to course");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error adding tutor to course:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

export async function removeTutorFromCourse(courseId, tutorId) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/tutors/${tutorId}`, {
      method: 'DELETE',
    });

    // Check if the response is not OK
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to remove tutor from course");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error removing tutor from course:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}
