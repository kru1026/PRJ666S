// my-app/lib/authenticate.js

import {jwtDecode} from 'jwt-decode';

  function setToken(token) {
    localStorage.setItem('access_token', token);
  }

  export function getToken() {
    try {
      return localStorage.getItem('access_token');
    } catch (err) {
      return null;
    }
  }

  export function removeToken() {
    localStorage.removeItem('access_token');
  }

  export function readToken() {
    try {
      const token = getToken();
      return token ? jwtDecode(token) : null;
    } catch (err) {
      return null;
    }
  }

  export function isAuthenticated() {
    const token = readToken();
    return token ? true : false;
  }

  export async function authenticateUser(user, password) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({ userName: user, password: password }),
      headers: {
        'content-type': 'application/json',
      },
    });
  
    const data = await res.json();
  
    if (res.status === 200) {
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('user is: ', data.user);
      return { token: data.token, user: data.user };  
    } else {
      throw new Error(data.message);
    }
  }

  export async function registerUser(user, password, password2, email, userType, firstName, lastName, institution, program) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        body: JSON.stringify({ userName: user, password: password, password2: password2, email: email, userType: userType, firstName: firstName, lastName: lastName, institution: institution, program: program }),
        headers: {
          'content-type': 'application/json',
        },
      });
    
      const data = await res.json();
    
      if (res.status === 200) {
        return true;
      } else {
        throw new Error(data.message);
      }
    }

    export async function resetPassword(user, email, newPassword) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
          method: 'POST',
          body: JSON.stringify({ userName: user, email: email, newPassword: newPassword }),
          headers: {
            'content-type': 'application/json',
          },
        });
      
        const data = await res.json();
      
        if (res.status === 200) {
          return true;
        } else {
          throw new Error(data.message);
        }
      }

    //   export async function getAllCourses() {
    //     try {
    //         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
    //             method: 'GET',
    //         });
    
    //         // Check if the response is not OK
    //         if (!res.ok) {
    //             const errorData = await res.json();
    //             throw new Error(errorData.message || "Failed to fetch courses");
    //         }
    
    //         const data = await res.json();
    
    //         return data;
    //     } catch (error) {
    //         console.error("Error fetching courses:", error);
    //         throw error;  // Rethrow the error to handle it in the calling function
    //     }
    // }

    export async function getAllCourses() {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/courses`;

    console.log("CALLING:", url);

    const res = await fetch(url);

    console.log("STATUS:", res.status);
    console.log("FINAL URL:", res.url);

    const text = await res.text();

    if (!res.ok) {
        throw new Error(text);
    }

    return JSON.parse(text);
}

    export async function getAllCoursesWithRatings() {
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAllCoursesWithRatings`, {
              method: 'GET',
          });
  
          // Check if the response is not OK
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || "Failed to fetch courses");
          }
  
          const data = await res.json();
  
          return data;
      } catch (error) {
          console.error("Error fetching courses:", error);
          throw error;  // Rethrow the error to handle it in the calling function
      }
  }

    export async function getOneCourse(courseCode) {
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseCode}`, {
              method: 'GET',
          });
  
          // Check if the response is not OK
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || "Failed to fetch course");
          }
  
          const data = await res.json();
  
          return data;
      } catch (error) {
          console.error("Error fetching courses:", error);
          throw error;  // Rethrow the error to handle it in the calling function
      }
    }

    export async function getUserByName(userName) {
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getUserByName/${userName}`, {
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

    
    export async function getAllCarts(userName) {
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAllCarts?userName=${userName}`, {
              method: 'GET',
          });
  
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || "Failed to fetch courses in cart");
          }
  
          const data = await res.json();
  
          return data;
      } catch (error) {
          console.error("Error fetching courses:", error);
          throw error;  
      }
  }

  export async function addCourseToCart(userName, courseCode, courseName, courseImgUrl, coursePrice, selectedTutor) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addCourseToCart`, {
        method: 'POST',
        body: JSON.stringify({ userName: userName, courseCode: courseCode, courseName: courseName, courseImgUrl: courseImgUrl, coursePrice: coursePrice, selectedTutor: selectedTutor }),
        headers: {
          'content-type': 'application/json',
        },
      });
    
      const data = await res.json();
    
      if (res.status === 200) {
        return true;
      } else {
        throw new Error(data.message);
      }
    }

   
    export async function addCourseToUser(userName, courseCode, selectedTutor, hours) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addCourseToUser`, {
        method: 'POST',
        body: JSON.stringify({ userName: userName, courseCode: courseCode, taughtBy: selectedTutor, hours: hours }), // include hours
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      // Check if the response was successful
      if (!res.ok) {
        const errorData = await res.json(); // Capture the error message
        throw new Error(errorData.message || 'Something went wrong');
      }
    
      const data = await res.json(); // Parse the response data
    
      return data; // Return the response data, in case you need it
    }
    

      export async function deleteAllCartsFromOneUser(userName) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deleteAllCartsFromOneUser?userName=${userName}`, {
                method: 'DELETE',
            });
    
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to delete carts");
            }
    
            const data = await res.json();
    
            return data;
        } catch (error) {
            console.error("Error deleting carts:", error);
            throw error;  
        }
    }

    export async function removeOneCourseFromCart(courseCode) {
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/removeOneCourseFromCart?courseCode=${courseCode}`, {
              method: 'DELETE',
          });
  
          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || "Failed to delete carts");
          }
  
          const data = await res.json();
         
          return data;
      } catch (error) {
          console.error("Error deleting carts:", error);
          throw error;  
      }
  }

  export async function removeOneCourseFromUserPurchased(userName, courseCode) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/removeOneCourseFromUserPurchased`, {
            method: 'POST',
            body: JSON.stringify({ userName: userName, courseCode: courseCode }),
            headers: {
              'content-type': 'application/json',
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to delete a course");
        }

        const data = await res.json();
        console.log("data return is: ", data);
        return data;
    } catch (error) {
        console.error("Error deleting a course:", error);
        throw error;  
    }
}

export async function getAllCoursesFromCourseCodes(courseCodesArray) {
  const courseCodes = courseCodesArray.join(',');
  try {
     
      if (!courseCodes) {
          throw new Error("Course code is required.");
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getAllCoursesFromCourseCodes?courseCode=${encodeURIComponent(courseCodes)}`, {
        method: 'GET',
      });

      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch courses with this course code.");
      }

      const data = await res.json();

      console.log("All courses from course code is: ", data);

      // Check if data is in the expected format
      if (!data || typeof data !== 'object') {
          throw new Error("Unexpected data format received.");
      }

      return data; // Return the fetched data
  } catch (error) {
      console.error("Error fetching courses with the provided course code:", error.message);
      throw error;  
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

    const data = await res.json(); // Assuming the API returns JSON data

    return data; // Return the list of tutors
  } catch (error) {
    console.error('Error fetching tutors:', error);
    throw error;
  }
}

