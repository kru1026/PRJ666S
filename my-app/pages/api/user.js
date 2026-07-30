// my-app/pages/api/user.js

export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' })
}

export async function getAllUser() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: 'GET',
    });

    // Check if the response is not OK
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch users");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;  // Rethrow the error to handle it in the calling function
  }
}

export async function updateUser(userId, editedUser) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedUser),
    });

    // Check if the response is not OK
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch users");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;  // Rethrow the error to handle it in the calling function
  }
}

export async function updatePendingCourse(tutorId, courseId) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${tutorId}/approvedPendingCourse`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId }),
    });

    // Check if the response is not OK
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch users");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;  // Rethrow the error to handle it in the calling function
  }
}

export async function addApplyCourse(userId, courseId) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/addApplyCourse`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId }),
    });

    // Check if the response is not OK
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch users");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;  // Rethrow the error to handle it in the calling function
  }
}

export async function removeApplyCourse(userId, courseId) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/removeApplyCourse`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId }),
    });

    // Check if the response is not OK
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch users");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;  // Rethrow the error to handle it in the calling function
  }
}

export async function getAllTutors() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tutors`, {
      method: 'GET',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to fetch tutors');
    }

    const tutors = await res.json();
    return tutors;
  } catch (error) {
    console.error('Error fetching tutors:', error);
    throw error; // Rethrow for handling in the calling function
  }
}

export async function addCourseToUserTeachingCourse(userId, courseId) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/teachingCourse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add course to user");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error adding course to user:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

export async function removeCourseToUserTeachingCourse(userId, courseId) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/teachingCourse/${courseId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add course to user");
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error adding course to user:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

export async function getUserById(userId) {
  try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getUserById/${userId}`, {
          method: 'GET',
      });

      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch user");
      }

      const data = await res.json();

      return data;
  } catch (error) {
      console.error("Error fetching courses:", error);
      throw error; 
  }
}