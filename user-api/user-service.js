// user-api/user-service.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { GridFSBucket } = require('mongodb');

let mongoDBConnectionString = process.env.MONGO_URL;

let Schema = mongoose.Schema;

let userSchema = new Schema({
    userName: String,
    password: String,
    email: String,
    userType: String, // "student" or "tutor"
    firstName: String,
    lastName: String,
    selfDescription: String,
    jobTitle: String,
    baseLocation: String,
    institution: String,
    program: String,
    certificates: [{
        fileUrl: String,
        fileName: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    purchasedCourse: [{
        courseCode: String,
        taughtBy: String,
        remainingHours: Number
    }],
    teachingCourse: [String],
    pendingCourse: [String],
    availability: [{
        startTime: Date,
        endTime: Date
    }],
    feedback: [{
        sessionId: String,
        courseCode: String,
        tutorId: String,
        rating: Number,
        feedbackNote: String,
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }],
    institution: String,
    program: String
});


let courseSchema = new Schema({
    courseCode: String,
    courseName: String,
    courseImgUrl: String,
    coursePrice: String,
    institution: String,
    description: String,
    published: Boolean,
    assignedTutors: [String],
    institution: String,
    program: String
});

let cartSchema = new Schema({
    userName: String,
    courseCode: String,
    courseName: String,
    courseImgUrl: String,
    coursePrice: String,
    selectedTutor: String
});

let appointmentSchema = new Schema({
    userName: String,
    firstName: String,
    lastName: String,
    phoneNum: String,
    selectedTutor: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    selectedCourse: String,
    remainingHoursAfterBooking: Number
});

let fileSchema = new Schema({
    userId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});


let Course;
let Cart;
let Appointment;
let User = mongoose.model("users", userSchema);
let gfs;
let File = mongoose.model("files", fileSchema);
let db;

module.exports = {
  User,  // Export the User model
  File,// Other exports...
};

module.exports.connect = function () {
    return new Promise(function (resolve, reject) {

        console.log("Mongo connection string exists:", !!mongoDBConnectionString);
        console.log("Mongo host:", mongoDBConnectionString?.split("@")[1]);

        db = mongoose.createConnection(mongoDBConnectionString);

        db.on('error', err => {
            reject(err);
        });

        db.once('open', () => {
            User = db.model("users", userSchema);
            Course = db.model("courses", courseSchema);
            Cart = db.model("cart", cartSchema);
            Appointment = db.model("appointment", appointmentSchema);
            File = db.model('files', fileSchema);
            gfs = new GridFSBucket(db.db, {
                bucketName: 'uploads'
            });
            resolve();
        });
    });
};

module.exports.gfs = () => gfs;

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {

        // Check if passwords match
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {
            // Check if the username or email already exists
            User.findOne({
                $or: [
                    { userName: userData.userName },
                    { email: userData.email }
                ]
            }).then(existingUser => {
                if (existingUser) {
                    if (existingUser.userName === userData.userName) {
                        reject("User Name already taken");
                    } else if (existingUser.email === userData.email) {
                        reject("Email already taken");
                    }
                } else {
                    // Hash the password if username and email are unique
                    bcrypt.hash(userData.password, 10).then(hash => {

                        userData.password = hash;

                        let newUser = new User(userData);

                        // Save the new user
                        newUser.save().then(() => {
                            resolve("User " + userData.userName + " successfully registered");
                        }).catch(err => {
                            reject("There was an error creating the user: " + err);
                        });
                    }).catch(err => reject(err));
                }
            }).catch(err => reject("Error checking for existing user: " + err));
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {

        User.findOne({ userName: userData.userName })
            .exec()
            .then(user => {
                bcrypt.compare(userData.password, user.password).then(res => {
                    if (res === true) {
                        resolve(user);
                    } else {
                        reject("Incorrect password for user " + userData.userName);
                    }
                });
            }).catch(err => {
                reject("Unable to find user " + userData.userName);
            });
    });
};

module.exports.deleteUser = function (userData) {
    return new Promise((resolve, reject) => {
        // First, verify the user's password using checkUser
        module.exports.checkUser(userData)
            .then(() => {
                // If password verification succeeds, delete the user
                User.deleteOne({ userName: userData.userName }).exec()
                    .then(result => {
                        if (result.deletedCount === 0) {
                            reject(`User ${userData.userName} not found.`);
                        } else {
                            resolve(`User ${userData.userName} has been successfully deleted.`);
                        }
                    })
                    .catch(err => {
                        reject(`Error while deleting user ${userData.userName}: ${err.message}`);
                    });
            })
            .catch(err => {
                reject(`Password verification failed: ${err}`);
            });
    });
};

module.exports.resetPassword = function (userName, email, newPassword) {
    return new Promise((resolve, reject) => {

        // Step 1: Find the user by userName and check if the email matches
        User.findOne({ userName: userName }).exec()
            .then(user => {
                if (!user) {
                    reject(`User ${userName} not found.`);
                    return;
                }

                // Check if the input email matches the stored email
                if (user.email !== email) {
                    reject(`Email does not match the stored email for user ${userName}.`);
                    return;
                }

                // Step 2: If email matches, hash the new password
                bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                    if (err) {
                        reject(`Error hashing the password: ${err.message}`);
                        return;
                    }

                    // Step 3: Update the user's password
                    user.password = hashedPassword;
                    user.save()
                        .then(() => {
                            resolve(`Password for user ${userName} has been successfully updated.`);
                        })
                        .catch(err => {
                            reject(`Error while updating password for user ${userName}: ${err.message}`);
                        });
                });
            })
            .catch(err => {
                reject(`Error while finding user ${userName}: ${err.message}`);
            });
    });
};

module.exports.getAllCourses = function () {
    return new Promise((resolve, reject) => {
        Course.find().exec()
            .then(courses => {
                if (courses.length === 0) {
                    reject("No courses found.");
                } else {
                    resolve(courses);
                }
            })
            .catch(err => {
                reject(`Error while fetching courses: ${err.message}`);
            });
    });
};

module.exports.updateCourse = function (courseId, updatedCourseData) {
    return new Promise((resolve, reject) => {
        Course.findByIdAndUpdate(courseId, updatedCourseData, { new: true })
            .then((updatedCourse) => {
                if (!updatedCourse) {
                    reject("Course not found.");
                } else {
                    resolve(updatedCourse);
                }
            })
            .catch((err) => {
                reject(`Error while updating course: ${err.message}`);
            });
    })
};

module.exports.getAllUsers = function () {
    return new Promise((resolve, reject) => {
        // User.find().exec()
        User.aggregate([
            {
              $set: {
                pendingCourse: {
                  $map: {
                    input: "$pendingCourse",
                    in: { $toObjectId: "$$this" }
                  }
                }
              }
            },
            {
              $lookup: {
                from: "courses",
                localField: "pendingCourse",
                foreignField: "_id",
                as: "pendingCourse"
              }
            }
        ])
            .then(users => {
                if (users.length === 0) {
                    reject("No users found.");
                } else {
                    resolve(users);
                }
            })
            .catch(err => {
                reject(`Error while fetching users: ${err.message}`);
            });
    });
};

module.exports.updateUser = function (userId, updatedData) {
    return new Promise((resolve, reject) => {
      User.findByIdAndUpdate(userId, {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        jobTitle: updatedData.jobTitle,
        baseLocation: updatedData.baseLocation,
        selfDescription: updatedData.selfDescription,
        institution: updatedData.institution,
        program: updatedData.program
      }, { new: true })
        .then((updatedUser) => {
          if (!updatedUser) {
            reject("User not found.");
          } else {
            resolve(updatedUser);
          }
        })
        .catch((err) => {
          reject(`Error while updating user: ${err.message}`);
        });
    });
  };

  module.exports.approvedPendingCourse = function (userId, courseId) {
    return new Promise((resolve, reject) => {
      User.findByIdAndUpdate(
        userId,
        {
          $pull: { pendingCourse: courseId },
          $push: { teachingCourse: courseId }
        },
        { new: true }
      )
        .then((updatedUser) => {
          if (!updatedUser) {
            reject("User not found.");
          } else {
            resolve(updatedUser);
          }
        })
        .catch((err) => {
          reject(`Error while approving pending course: ${err.message}`);
        });
    });
  };

  module.exports.getAllTutors = function () {
    return new Promise((resolve, reject) => {
      User.find({ userType: 'tutor' })
        .then(tutors => {
          // Return an empty array if no tutors are found
          if (tutors.length === 0) {
            resolve([]);  // Resolve with an empty array, instead of rejecting
          } else {
            resolve(tutors);  // Resolve with the list of tutors
          }
        })
        .catch(err => {
          reject(`Error while fetching tutors: ${err.message}`);  // Catch any errors
        });
    });
  };
  

module.exports.addCourseToUserTeachingCourse = function (courseId, tutorId) {
    return new Promise((resolve, reject) => {
      User.findOne({ _id: tutorId, teachingCourse: courseId }) // Check if courseId already exists in teachingCourse
        .then((existingTutor) => {
          if (existingTutor) {
            reject("Course already assigned to this tutor.");
          } else {
            // If courseId is not found, add it
            User.findByIdAndUpdate(
              tutorId,
              { $push: { teachingCourse: courseId } },
              { new: true }
            )
              .then((updatedTutor) => {
                if (!updatedTutor) {
                  reject("Tutor not found.");
                } else {
                  resolve(updatedTutor);
                }
              })
              .catch((err) => {
                reject(`Error while adding course to tutor: ${err.message}`);
              });
          }
        })
        .catch((err) => {
          reject(`Error checking if course is already assigned: ${err.message}`);
        });
    });
  };

  module.exports.addCourseToUserPendingCourse = function (userId, courseId) {
    return new Promise((resolve, reject) => {
      User.findByIdAndUpdate(
        userId,
        { $push: { pendingCourse: courseId } },
        { new: true }
      )
        .then((updatedUser) => {
          if (!updatedUser) {
            reject("User not found.");
          } else {
            resolve(updatedUser);
          }
        })
        .catch((err) => {
          reject(`Error while adding course to user's pending course: ${err.message}`);
        });
    });
  };

  module.exports.removeCourseFromUserPendingCourse = function (userId, courseId) {
    return new Promise((resolve, reject) => {
      User.findByIdAndUpdate(
        userId,
        { $pull: { pendingCourse: courseId } },
        { new: true }
      )
        .then((updatedUser) => {
          if (!updatedUser) {
            reject("User not found.");
          } else {
            resolve(updatedUser);
          }
        })
        .catch((err) => {
          reject(`Error while removing course from user's pending course: ${err.message}`);
        });
    });
  };
  

module.exports.removeCourseToUserTeachingCourse = function (courseId, tutorId) {
    return new Promise((resolve, reject) => {
        User.findByIdAndUpdate(tutorId, { $pull: { teachingCourse: courseId } })
            .then((updatedCourse) => {
                if (!updatedCourse) {
                    reject("Course not found.");
                } else {
                    resolve(updatedCourse);
                }
            })
            .catch((err) => {
                reject(`Error while adding tutor to course: ${err.message}`);
            });
    })
};

module.exports.createCourse = function (newCourseData) {
    return new Promise((resolve, reject) => {
        const newCourse = new Course(newCourseData);
        newCourse.save()
            .then(createdCourse => {
                if (!createdCourse) {
                    reject("Error creating course.");
                } else {
                    resolve(createdCourse);
                }
            })
            .catch(err => {
                reject(`Error while creating course: ${err.message}`);
            });
    });
};

module.exports.addTutorToCourse = function (courseId, tutorId) {
    return new Promise((resolve, reject) => {
        Course.findByIdAndUpdate(courseId, { $push: { assignedTutors: tutorId } })
            .then((updatedCourse) => {
                if (!updatedCourse) {
                    reject("Course not found.");
                } else {
                    // User.findByIdAndUpdate(tutorId, { $push: { teachingCourse: courseId } });
                    // if (updatedCourse.assignedTutors.includes(tutorId)) {
                        updatedCourse.assignedTutors.push(tutorId);
                    // }
                    resolve(updatedCourse);
                }
            })
            .catch((err) => {
                reject(`Error while adding tutor to course: ${err.message}`);
            });
    })
};

module.exports.removeTutorFromCourse = function (courseId, tutorId) {
    return new Promise((resolve, reject) => {
        Course.findByIdAndUpdate(courseId, { $pull: { assignedTutors: tutorId } })
            .then((updatedCourse) => {
                if (!updatedCourse) {
                    reject("Course not found.");
                } else {
                    // User.findByIdAndUpdate(tutorId, { $pull: { teachingCourse: courseId } });
                    if (updatedCourse.assignedTutors.includes(tutorId)) {
                        const indexToRemove = updatedCourse.assignedTutors.indexOf(tutorId);
                        updatedCourse.assignedTutors.splice(indexToRemove, 1);
                    }
                    resolve(updatedCourse);
                }
            })
            .catch((err) => {
                reject(`Error while removing tutor from course: ${err.message}`);
            });
    });
};

// module.exports.getCourseByCode = function (courseCode) {
//     return new Promise((resolve, reject) => {
//         Course.aggregate([
//             { $match: { courseCode: courseCode } },
//             {
//               $set: {
//                 assignedTutors: {
//                   $map: {
//                     input: "$assignedTutors",
//                     in: { $toObjectId: "$$this" }
//                   }
//                 }
//               }
//             },
//             {
//               $lookup: {
//                 from: "users",
//                 localField: "assignedTutors",
//                 foreignField: "_id",
//                 as: "assignedTutors"
//               }
//             }
//           ])
//             .then((courses) => {
//                 console.log(courses)
//                 if (courses.length === 0) {
//                     reject(`Course with code ${courseCode} not found.`);
//                 } else {
//                     resolve(courses[0]);
//                 }
//             })
//             .catch((err) => {
//                 reject(`Error while retrieving course with code ${courseCode}: ${err.message}`);
//             });
//     });
// };

module.exports.getCourseByCode = function (courseCode) {
  return new Promise((resolve, reject) => {
    Course.aggregate([
      { $match: { courseCode: courseCode } }, // Match course by courseCode
      {
        $set: {
          assignedTutors: {
            $map: {
              input: "$assignedTutors", // Convert assignedTutors to ObjectId
              in: { $toObjectId: "$$this" }
            }
          }
        }
      },
      {
        $lookup: {
          from: "users", // Lookup in the users collection
          localField: "assignedTutors", // Match assignedTutors with User _id
          foreignField: "_id",
          as: "assignedTutors" // Assign tutors to the assignedTutors array
        }
      },
      {
        $lookup: {
          from: "users", // Lookup in the users collection again for purchases
          localField: "courseCode", // Match courseCode in purchasedCourse
          foreignField: "purchasedCourse.courseCode", // Foreign field in purchasedCourse
          as: "purchasedUsers" // Create an array of users who purchased the course
        }
      },
      {
        $addFields: {
          purchasedCount: { $size: "$purchasedUsers" } // Add a field for the count of purchases
        }
      },
      {
        $project: {
          courseCode: 1, // Include courseCode
          courseName: 1, // Include courseName
          courseImgUrl: 1, // Include courseImgUrl
          coursePrice: 1, // Include coursePrice
          institution: 1, // Include institution
          program: 1,
          description: 1,
          assignedTutors: 1, // Include assignedTutors
          purchasedCount: 1 // Include the purchase count
        }
      }
    ])
      .then((courses) => {
        console.log(courses); // Log the result for debugging
        if (courses.length === 0) {
          reject(`Course with code ${courseCode} not found.`);
        } else {
          resolve(courses[0]); // Resolve the first course with purchasedCount
        }
      })
      .catch((err) => {
        reject(`Error while retrieving course with code ${courseCode}: ${err.message}`);
      });
  });
};


module.exports.getCurrentUser = function (userName) {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userName }).exec()
            .then(user => {
                if (!user) {
                    reject(`User with userName ${userName} not found.`);
                } else {
                    resolve(user);
                }
            })
            .catch(err => {
                reject(`Error while retrieving user with userName ${userName}: ${err.message}`);
            });
    });
};

module.exports.getCurrentUserById = function (userId) {
    return new Promise((resolve, reject) => {
        User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            {
              $set: {
                teachingCourse: {
                  $map: {
                    input: "$teachingCourse",
                    in: { $toObjectId: "$$this" }
                  }
                }
              }
            },
            {
              $lookup: {
                from: "courses",
                localField: "teachingCourse",
                foreignField: "_id",
                as: "teachingCourse"
              }
            }
          ])
            .then(user => {
                if (!user) {
                    reject(`User with userId ${userId} not found.`);
                } else {
                    resolve(user[0]);
                }
            })
            .catch(err => {
                reject(`Error while retrieving user with userId ${userId}: ${err.message}`);
            });
    });
};

module.exports.getAllCarts = function (userName) {
    return new Promise((resolve, reject) => {
        Cart.find({ userName: userName }).exec()  // Filter courses by userName
            .then(courses => {
                if (courses.length === 0) {
                    reject("No courses added to cart for this user.");
                } else {
                    resolve(courses);
                }
            })
            .catch(err => {
                reject(`Error while fetching courses in cart: ${err.message}`);
            });
    });
};

// Add Course to Cart Function
module.exports.addCourseToCart = async function (userData) {
    try {
        return await new Promise(async function (resolve, reject) {
            // Check if the course already exists in the user's cart
            const existingCourse = await Cart.findOne({
                userName: userData.userName, 
                courseCode: userData.courseCode,
            });

            if (existingCourse) {
                // If the course is already in the cart, reject with a message
                reject("Course already exists in the cart. Please remove it in the cart page first.");
            } else {
                // If not, proceed to add the course to the cart
                let newCart = new Cart(userData); // Create a new Cart object with the provided userData

                newCart
                    .save() // Save the new Cart entry to the database
                    .then(() => {
                        resolve(`Course ${userData.courseCode} successfully saved to cart.`);
                    })
                    .catch((err) => {
                        reject("There was an error adding the course to the cart: " + err);
                    });
            }
        });
    } catch (err) {
        return Promise.reject("Error while adding course to cart: " + err);
    }
};

module.exports.addCourseToUser = async function (body) {
    const { userName, courseCode, taughtBy, hours } = body;

    // Validate input
    if (!userName || !courseCode || !taughtBy || typeof hours !== 'number') {
        throw new Error("Invalid input data. Please provide userName, courseCode, taughtBy, and a valid number for hours.");
    }

    try {
        // Find the user by userName
        const user = await User.findOne({ userName: userName });
        if (!user) {
            throw new Error("User not found");
        }

        // Check if the course already exists in the purchasedCourse array
        // if (user.purchasedCourse.some(course => course.courseCode === courseCode)) {
        //     throw new Error("Course already exists in user's purchased courses");
        // }

        // Add the new course to the purchasedCourse array
        user.purchasedCourse.push({
            courseCode: courseCode,
            taughtBy: taughtBy,
            remainingHours: hours // match the schema's remainingHours field
        });

        // Save the updated user document
        await user.save();

        return `Course ${courseCode} successfully added to user ${userName} with ${hours} hours.`;

    } catch (error) {
        throw new Error("Error adding course to user: " + error.message);
    }
};



module.exports.deleteAllCartsFromOneUser = async function (userName) {
    try {
        const result = await Cart.deleteMany({ userName });
        if (result.deletedCount > 0) {
            return { message: `Successfully deleted ${result.deletedCount} courses from cart for user ${userName}` };
        } else {
            return { message: `No course in cart found for user ${userName}` };
        }
    } catch (error) {
        console.error("Error deleting courses in cart for user:", error);
        throw new Error("Error deleting courses in cart for user");
    }
};


module.exports.removeOneCourseFromCart = async function (courseCode) {
    try {
        const result = await Cart.deleteOne({ courseCode });
        if (result.deletedCount > 0) {
            return { message: `Successfully deleted course with code: ${courseCode}` };
        } else {
            return { message: `Course with code: ${courseCode} not found in cart` };
        }
    } catch (error) {
        console.error("Error deleting course from cart:", error);
        throw new Error("Error deleting course from cart");
    }
};

module.exports.removeOneCourseFromUserPurchased = async function (userName, courseCode) {
    try {
        const user = await User.findOne({ userName: userName });
        if (!user) {
            throw new Error("User not found");
        }
        // Check if the course exists in the purchased courses
        const courseIndex = user.purchasedCourse.indexOf(courseCode);
        if (courseIndex === -1) {
            throw new Error("Course not found in user's courses");
        }
        // Remove the course from the array
        user.purchasedCourse.splice(courseIndex, 1);
        await user.save();

        return `Course ${courseCode} successfully removed from user ${userName}`;
    } catch (error) {
        throw new Error("Error removing course from user: " + error.message);
    }
};

module.exports.createAppointment = async function (userData) {
    return new Promise(function (resolve, reject) {

                let newAppointment = new Appointment(userData);

                newAppointment.save().then(() => {
                    resolve("Appointment successfully saved");  
                }).catch(err => {
                     {
                      reject("There was an error creating the user: " + err);
                     }
                })
            }).catch(err => reject(err));
};

module.exports.deleteOneAppointment = async function (appointmentId) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Appointment.findByIdAndDelete(appointmentId);
            if (result) {
                resolve("Appointment successfully deleted");
            } else {
                reject("Appointment not found");
            }
        } catch (err) {
            reject("There was an error deleting the appointment: " + err);
        }
    });
};

module.exports.getAppointmentsForUser = function (userName) {
    return new Promise((resolve, reject) => {
        Appointment.find({ userName: userName }).exec() 
            .then(appointments => {
                if (appointments.length === 0) {
                    reject("No appointment for this user.");
                } else {
                    resolve(appointments);
                }
            })
            .catch(err => {
                reject(`Error while fetching appointment in this user: ${err.message}`);
            });
    });
};

module.exports.getAllCoursesFromOneUser = function (userName) {
    return new Promise((resolve, reject) => {
        User.aggregate([
            { $match: { userName: userName } }, // Match the user by userName
            { 
                $unwind: "$purchasedCourse" // Unwind the purchasedCourse array so we can join with the courses
            },
            {
                $lookup: {
                    from: "courses", // Lookup in the "courses" collection
                    localField: "purchasedCourse.courseCode", // Match the courseCode in purchasedCourse
                    foreignField: "courseCode", // Match it with the courseCode in the courses collection
                    as: "courseDetails" // Store the result in the courseDetails field
                }
            },
            {
                $unwind: "$courseDetails" // Unwind courseDetails so we can access the fields directly
            },
            {
                $project: {
                    _id: 0, // Exclude the MongoDB _id field
                    "purchasedCourse.courseCode": 1, // Include courseCode
                    "purchasedCourse.taughtBy": 1, // Include taughtBy
                    "purchasedCourse.remainingHours": 1, // Include remainingHours
                    "courseDetails.courseName": 1, // Include courseName from courseDetails
                    "courseDetails.courseImgUrl": 1, // Include courseImgUrl from courseDetails
                    "courseDetails.coursePrice": 1, // Include coursePrice from courseDetails
                    "courseDetails.school": 1, // Include school from courseDetails
                    "courseDetails.description": 1 // Include description from courseDetails
                }
            }
        ]).exec()
            .then(purchasedCourses => {
                //if (purchasedCourses.length === 0) {
                   //reject("No purchased courses found for this user.");
                //} else {
                    resolve(purchasedCourses); // Return the purchased courses with course details
                //}
            })
            .catch(err => {
                reject(`Error while fetching purchased courses for user ${userName}: ${err.message}`);
            });
    });
};


module.exports.getAllCoursesFromOneTutor = function (userName) {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userName }).exec()
            .then(user => {
                if (!user || !Array.isArray(user.teachingCourse) || user.teachingCourse.length === 0) {
                    reject("This tutor teaches no course.");
                } else {
                    resolve(user.teachingCourse); // Return the array of course codes
                }
            })
            .catch(err => {
                reject(`Error while fetching courses for this user: ${err.message}`);
            });
    });
};



module.exports.getAllCoursesFromCourseCodes = function (courseCodes) {
    return new Promise((resolve, reject) => {
        Course.find({ courseCode: { $in: courseCodes } }).exec()
            .then(courses => {
                if (courses.length === 0) {
                    reject("No courses in this course code.");
                } else {
                    resolve(courses);
                }
            })
            .catch(err => {
                reject(`Error while fetching courses in this course code: ${err.message}`);
            });
    });
};
        

module.exports.createAvailability = function (data) {
    return new Promise((resolve, reject) => {

        // Validate that required fields are present
        if (!data._id || !data.availability || !data.availability.startTime || !data.availability.endTime) {
            return reject("Missing required fields: _id, availability.startTime, and availability.endTime.");
        }

        // Use findByIdAndUpdate with $push to create a new availability entry
        User.findByIdAndUpdate(
            data._id,
            { 
                $push: { // Add new availability entry
                    availability: { 
                        startTime: data.availability.startTime,
                        endTime: data.availability.endTime 
                    }
                } 
            },
            { new: true } // Return the updated document
        )
        .then((updatedUser) => {
            if (!updatedUser) {
                reject("User not found."); // User not found scenario
            } else {
                resolve(updatedUser); // Successfully created new availability
            }
        })
        .catch((err) => {
            reject(`Error while creating availability: ${err.message}`); // Catch any errors
        });
    });
};

module.exports.deleteOneAvailability = function (data) {
    return new Promise((resolve, reject) => {

        User.findOneAndUpdate(
            { 'availability._id': data }, 
            {
                $pull: { 
                    availability: {
                        _id: data, 
                    }
                }
            },
            { new: true }
        )
        .then((updatedUser) => {
            if (!updatedUser) {
                reject("User not found."); // User not found scenario
            } else {
                resolve(updatedUser); // Successfully removed availability
            }
        })
        .catch((err) => {
            reject(`Error while deleting availability: ${err.message}`); // Catch any errors
        });
    });
};


        module.exports.getTutorsByCourseCode = function (id, courseCode) {
            return new Promise((resolve, reject) => {
                User.findOne({ _id: id }).exec()
                    .then(user => {
                        // Check if the user exists and has purchased courses
                        if (!user || !user.purchasedCourse || user.purchasedCourse.length === 0) {
                            return reject("No purchased courses for this user.");
                        }
        
                        // Extract tutors from the purchased courses
                        const tutors = user.purchasedCourse
                            .filter(course => course.courseCode === courseCode) // Ensure it matches the course code
                            .map(course => course.taughtBy);
        
                        // Check if any tutors were found
                        if (tutors.length === 0) {
                            return reject("No tutors found for the specified course code.");
                        }
        
                        // Resolve with the found tutors
                        resolve(tutors);
                    })
                    .catch(err => {
                        // Handle any errors during the query
                        reject(`Error while fetching courses for this user: ${err.message}`);
                    });
            });
        };


        module.exports.getRemainingHoursForOneCourse = function (userName, courseCode, tutor) {
            return new Promise((resolve, reject) => {
                User.findOne({ userName }).exec()
                    .then(user => {
                        // Check if the user exists and has purchased courses
                        if (!user || !user.purchasedCourse || user.purchasedCourse.length === 0) {
                            return reject("No purchased courses for this user.");
                        }
        
                        // Extract remaining hours from the purchased courses that match the course code
                        const courseData = user?.purchasedCourse?.find(course => (course.courseCode === courseCode) && (course.taughtBy === tutor ));
    
                        if (!courseData) {
                            return reject("No remaining hours found for the specified course code for this user.");
                        }
        
                        // Resolve with the remaining hours
                        resolve(courseData.remainingHours);
                    })
                    .catch(err => {
                        // Handle any errors during the query
                        reject(`Error while fetching course remaining hours for this user: ${err.message}`);
                    });
            });
        };


        module.exports.updateRemainingHours = function (userId, courseCode, tutor, newRemainingHours) {
            return new Promise((resolve, reject) => {
                
                User.findOne({ _id: userId }).exec()
                    .then(user => {
                        // Check if the user exists and has purchased courses
                        if (!user || !user.purchasedCourse || user.purchasedCourse.length === 0) {
                            return reject("No purchased courses for this user.");
                        }
        
                        // Extract course data that matches the course code
                        const courseData = user.purchasedCourse.find(course => course.courseCode === courseCode && course.taughtBy === tutor);
        
                        if (!courseData) {
                            return reject("No course found for the specified course code for this user.");
                        }
        
                        // Update the remaining hours
                        courseData.remainingHours = newRemainingHours;
        
                        // Save the updated user document
                        return user.save();
                    })
                    .then(updatedUser => {
                        // Resolve with the updated remaining hours
                        const updatedCourseData = updatedUser.purchasedCourse.find(course => course.courseCode === courseCode);
                        resolve(updatedCourseData.remainingHours);
                    })
                    .catch(err => {
                        // Handle any errors during the process
                        reject(`Error while updating course remaining hours for this user: ${err.message}`);
                    });
            });
        };

        module.exports.addRatingToTutorById = function (tutorId, feedbackData) {
            return new Promise((resolve, reject) => {
              // Find the tutor by ID
              User.findById(tutorId)
                .then(tutor => {
                  if (!tutor) {
                    reject("Tutor not found.");
                  } else {
                    // Add the feedback to the tutor
                    tutor.feedback.push(feedbackData);
                    tutor.save()
                      .then(() => resolve("Feedback successfully added."))
                      .catch(err => reject("Error while saving feedback: " + err));
                  }
                })
                .catch(err => reject("Error while adding feedback: " + err));
            });
          };
        

          // module.exports.getMostPurchasedCourses = async function () {
          //   try {
          //     const mostPurchasedCourses = await User.aggregate([
          //       {
          //         $unwind: "$purchasedCourse"  // Unwind the purchasedCourse array
          //       },
          //       {
          //         $group: {
          //           _id: "$purchasedCourse.courseCode",  // Group by course code
          //           purchaseCount: { $sum: 1 }  // Count the number of purchases
          //         }
          //       },
          //       {
          //         $sort: { purchaseCount: -1 }  // Sort by purchase count
          //       },
          //       // {
          //       //   $limit: 5  // Limit to top 5
          //       // },
          //       {
          //         $lookup: {
          //           from: "courses",  // Name of the courses collection
          //           localField: "_id", // Field from the User aggregation
          //           foreignField: "courseCode", // Field from the Course collection
          //           as: "courseDetails" // Output array field
          //         }
          //       },
          //       {
          //         $unwind: "$courseDetails" // Unwind to flatten the course details
          //       },
          //       {
          //         $project: { // Select the fields to return
          //           courseCode: "$_id",
          //           courseName: "$courseDetails.courseName",
          //           courseImgUrl: "$courseDetails.courseImgUrl",
          //           coursePrice: "$courseDetails.coursePrice",
          //           purchaseCount: 1 // Include the purchase count
          //         }
          //       }
          //     ]);
          
          //     return mostPurchasedCourses;
          //   } catch (err) {
          //     console.error(err);
          //     throw new Error('Error fetching most purchased courses'); // More user-friendly error
          //   }
          // };

          module.exports.getMostPurchasedCourses = async function () {
            try {
              const mostPurchasedCourses = await Course.aggregate([
                // Look for all courses
                {
                  $lookup: {
                    from: "users",  // Join with the users collection
                    localField: "courseCode",  // Match courseCode in the Course collection
                    foreignField: "purchasedCourse.courseCode",  // Match courseCode in the purchasedCourse array of User
                    as: "purchasedUsers"  // This will create an array of users who purchased this course
                  }
                },
                {
                  $addFields: {
                    purchaseCount: { $size: "$purchasedUsers" }  // Count the number of users who purchased this course
                  }
                },
                {
                  $sort: { purchaseCount: -1 }  // Sort courses by purchase count in descending order
                },
                {
                  $project: {  // Project the fields you need in the response
                    courseCode: 1, 
                    courseName: 1, 
                    courseImgUrl: 1, 
                    coursePrice: 1, 
                    purchaseCount: 1  // Include the purchase count
                  }
                },
                {
                  $limit: 5  // Limit to top 5 most purchased courses
                }
              ]);
          
              return mostPurchasedCourses;
            } catch (err) {
              console.error(err);
              throw new Error('Error fetching most purchased courses');
            }
          };
          


          module.exports.getRatings = async function () {
            try {
              const ratedCourses = await User.aggregate([
                // Match users with feedback that includes a rating
                { 
                  $match: { "feedback.rating": { $exists: true, $ne: null } } 
                },
                // Unwind the feedback array to process each feedback item individually
                { 
                  $unwind: "$feedback" 
                },
                // Filter for feedback items that have a rating
                { 
                  $match: { "feedback.rating": { $exists: true, $ne: null } } 
                },
                // Group by course code and collect ratings
                {
                  $group: {
                    _id: "$feedback.courseCode",
                    ratings: { $push: "$feedback.rating" },
                    userIds: { $addToSet: "$_id" }
                  }
                },
                // Optionally, calculate the average rating for each course
                {
                  $addFields: {
                    averageRating: { $avg: "$ratings" }
                  }
                }
              ]);
          
              return ratedCourses;
              
            } catch (error) {
              throw new Error(`Error while fetching rated courses: ${error.message}`);
            }
          };


          module.exports.getMostRatedCourses = async function () {
            try {
              const ratedCourses = await User.aggregate([
                // Match users with feedback that includes a rating
                { 
                  $match: { "feedback.rating": { $exists: true, $ne: null } } 
                },
                // Unwind the feedback array to process each feedback item individually
                { 
                  $unwind: "$feedback" 
                },
                // Lookup to join with the Course collection to get course details
                {
                  $lookup: {
                    from: "courses", // Ensure this matches your actual Course collection name
                    localField: "feedback.courseCode",
                    foreignField: "courseCode",
                    as: "courseDetails"
                  }
                },
                // Unwind courseDetails to flatten the structure
                {
                  $unwind: {
                    path: "$courseDetails",
                    preserveNullAndEmptyArrays: true // Allow documents without matching course details
                  }
                },
                // Group by course code and collect ratings
                {
                  $group: {
                    _id: "$feedback.courseCode",
                    ratings: { $push: "$feedback.rating" },
                    userIds: { $addToSet: "$_id" },
                    ratingCount: { $sum: 1 }, // Count the number of ratings for each course
                    courseName: { $first: "$courseDetails.courseName" }, // Include course name
                    courseImgUrl: { $first: "$courseDetails.courseImgUrl" }, // Include course image URL
                    coursePrice: { $first: "$courseDetails.coursePrice" } // Include course price
                  }
                },
                // Calculate the average rating for each course
                {
                  $addFields: {
                    averageRating: { $round: [{ $avg: "$ratings" }, 1] }
                  }
                },
                // Sort courses by the count of ratings in descending order
                {
                  $sort: { averageRating: -1 }
                },
                // Project the desired fields for the response
                {
                  $project: {
                    courseCode: "$_id",
                    courseName: 1, // Using the aggregated course name
                    courseImgUrl: 1, // Using the aggregated course image URL
                    coursePrice: 1, // Using the aggregated course price
                    ratingCount: 1, // Include the count of ratings
                    averageRating: 1 // Include the average rating
                  }
                }
              ]);
          
              return ratedCourses;
              
            } catch (error) {
              throw new Error(`Error while fetching rated courses: ${error.message}`);
            }
          };
          
          
          module.exports.getFilesForOneUser = function (userId) {
            return new Promise((resolve, reject) => {
                File.find({ userId }) // Use find instead of findOne
                    .exec()
                    .then(files => {
                        if (!files.length) { // Check if the array is empty
                            reject(`No files found for user with ID ${userId}.`);
                        } else {
                            resolve(files); // Resolve with the array of files
                        }
                    })
                    .catch(err => {
                        reject(`Error while retrieving files for user ID ${userId}: ${err.message}`);
                    });
            });
        };


        module.exports.getCoursesWithRatings = async function () {
            try {
              const ratedCourses = await User.aggregate([
                // Match users with feedback that includes a rating
                { 
                  $match: { "feedback.rating": { $exists: true, $ne: null } } 
                },
                // Unwind the feedback array to process each feedback item individually
                { 
                  $unwind: "$feedback" 
                },
                // Lookup to join with the Course collection to get course details
                {
                  $lookup: {
                    from: "courses", // Ensure this matches your actual Course collection name
                    localField: "feedback.courseCode",
                    foreignField: "courseCode",
                    as: "courseDetails"
                  }
                },
                // Unwind courseDetails to flatten the structure
                {
                  $unwind: {
                    path: "$courseDetails",
                    preserveNullAndEmptyArrays: true // Allow documents without matching course details
                  }
                },
                // Group by course code and collect ratings
                {
                  $group: {
                    _id: "$feedback.courseCode",
                    ratings: { $push: "$feedback.rating" },
                    userIds: { $addToSet: "$_id" },
                    ratingCount: { $sum: 1 }, // Count the number of ratings for each course
                    courseName: { $first: "$courseDetails.courseName" }, // Include course name
                    courseImgUrl: { $first: "$courseDetails.courseImgUrl" }, // Include course image URL
                    coursePrice: { $first: "$courseDetails.coursePrice" } // Include course price
                  }
                },
                // Calculate the average rating for each course
                {
                  $addFields: {
                    averageRating: { $round: [{ $avg: "$ratings" }, 1] }
                  }
                },
                // Sort courses by the count of ratings in descending order
                {
                  $sort: { averageRating: -1 }
                },
                // Project the desired fields for the response
                {
                  $project: {
                    courseCode: "$_id",
                    courseName: 1, // Using the aggregated course name
                    courseImgUrl: 1, // Using the aggregated course image URL
                    coursePrice: 1, // Using the aggregated course price
                    ratingCount: 1, // Include the count of ratings
                    averageRating: 1 // Include the average rating
                  }
                }
              ]);
          
              return ratedCourses;
              
            } catch (error) {
              throw new Error(`Error while fetching rated courses: ${error.message}`);
            }
          };


          module.exports.getPurchasedCount = async function (courseCode) {
            try {
              const coursesWithFeedbackCount = await Course.aggregate([
                // Match the course by its courseCode
                {
                  $match: { courseCode: courseCode }
                },
                // Lookup to join the Course collection with the User collection to get the feedback
                {
                  $lookup: {
                    from: "users", // The User collection
                    localField: "courseCode", // Match courseCode in Course collection
                    foreignField: "feedback.courseCode", // Match courseCode in the feedback array of User collection
                    as: "userFeedback" // Join feedback as an array
                  }
                },
                // Add the feedback count to the course attributes
                {
                  $addFields: {
                    feedbackCount: { $size: "$userFeedback" } // Count the number of feedbacks
                  }
                },
                // Project the desired fields
                {
                  $project: {
                    courseCode: 1, // Include courseCode
                    courseName: 1, // Include courseName
                    courseImgUrl: 1, // Include courseImgUrl
                    coursePrice: 1, // Include coursePrice
                    feedbackCount: 1 // Include feedback count
                  }
                }
              ]);
          
              return coursesWithFeedbackCount;
            } catch (error) {
              throw new Error(`Error while fetching purchased count for courseCode: ${error.message}`);
            }
          };
          
          
          module.exports.getAllCoursesWithRating = function () {
            return new Promise((resolve, reject) => {
                Course.aggregate([
                    // Lookup to join with the User collection to get feedback ratings for each course
                    {
                        $lookup: {
                            from: "users", // Ensure this matches your actual User collection name
                            localField: "courseCode", // Field in Course collection
                            foreignField: "feedback.courseCode", // Field in User collection
                            as: "userFeedback"
                        }
                    },
                    // Add an additional field to ensure that courses with no feedback will have an empty array
                    {
                        $addFields: {
                            userFeedback: { $ifNull: ["$userFeedback", []] }
                        }
                    },
                    // Group by course code and aggregate ratings
                    {
                        $group: {
                            _id: "$courseCode",
                            courseName: { $first: "$courseName" },
                            courseImgUrl: { $first: "$courseImgUrl" },
                            coursePrice: { $first: "$coursePrice" },
                            description: { $first: "$description" },
                            assignedTutors: { $first: "$assignedTutors" }, // Include assignedTutors in the grouping
                            institution: { $first: "$institution" },
                            program: { $first: "$program" },
                            ratings: { $push: "$userFeedback.feedback.rating" }
                        }
                    },
                    // Calculate the average rating for each course
                    {
                        $addFields: {
                            averageRating: {
                                $round: [
                                    { $avg: { $ifNull: ["$ratings", [0]] } }, // Default to 0 if no ratings exist
                                    1 // Round to 1 decimal place
                                ]
                            }
                        }
                    },
                    // Project the necessary fields
                    {
                        $project: {
                            courseCode: "$_id",
                            courseName: 1,
                            courseImgUrl: 1,
                            coursePrice: 1,
                            averageRating: 1,
                            description: 1,
                            institution: 1,
                            program: 1,
                            assignedTutors: 1 // Ensure assignedTutors is projected
                        }
                    }
                ])
                .then(courses => {
                    if (courses.length === 0) {
                        reject("No courses found.");
                    } else {
                        resolve(courses);
                    }
                })
                .catch(err => {
                    reject(`Error while fetching courses: ${err.message}`);
                });
            });
        };
        
        
        module.exports.getAllCoursesWithRating2 = async function () {
          try {
            const coursesWithRating = await Course.aggregate([
              // Lookup to join courses with users' feedback based on courseCode
              {
                $lookup: {
                  from: "users", // Ensure this matches your actual User collection name
                  let: { courseCode: "$courseCode" },
                  pipeline: [
                    { $unwind: "$feedback" }, // Unwind feedback to process each rating
                    { $match: { "feedback.rating": { $exists: true, $ne: null } } },
                    {
                      $match: {
                        $expr: { $eq: ["$feedback.courseCode", "$$courseCode"] } // Match courseCode
                      }
                    },
                    {
                      $group: {
                        _id: "$feedback.courseCode",
                        ratings: { $push: "$feedback.rating" },
                        userIds: { $addToSet: "$_id" } // Collect user IDs for reference
                      }
                    },
                    {
                      $addFields: {
                        averageRating: { $avg: "$ratings" } // Calculate average rating
                      }
                    }
                  ],
                  as: "courseFeedback"
                }
              },
              // Add fields from courseFeedback (if present), otherwise set defaults
              {
                $addFields: {
                  ratings: { $ifNull: [{ $arrayElemAt: ["$courseFeedback.ratings", 0] }, []] },
                  averageRating: { $ifNull: [{ $arrayElemAt: ["$courseFeedback.averageRating", 0] }, null] },
                  userIds: { $ifNull: [{ $arrayElemAt: ["$courseFeedback.userIds", 0] }, []] }
                }
              },
              // Project only the required fields
              {
                $project: {
                  courseCode: 1,
                  courseName: 1,
                  courseImgUrl: 1,
                  coursePrice: 1,
                  description: 1,
                  institution: 1,
                  program: 1,
                  assignedTutors: 1,
                  ratings: 1,
                  averageRating: 1,
                  userIds: 1
                }
              }
            ]);
        
            return coursesWithRating;
          } catch (error) {
            throw new Error(`Error while fetching courses with ratings: ${error.message}`);
          }
        };


        module.exports.getTutorsWithAvgRating = async function () {
          try {
              const tutors = await db.collection('users').aggregate([
                  // Match only tutors
                  { $match: { userType: "tutor" } },
      
                  // Unwind the feedback array, preserving null or empty feedbacks
                  { $unwind: { path: "$feedback", preserveNullAndEmptyArrays: true } },
      
                  // Group by tutor _id, and calculate the average rating
                  {
                    $group: {
                      _id: "$_id",
                      name: { $first: "$name" },
                      userName: { $first: "$userName" },
                      userType: { $first: "$userType" },
                      firstName: { $first: "$firstName" },
                      lastName: { $first: "$lastName" },
                      teachingCourse: { $first: "$teachingCourse" },
                      feedback: { $first: "$feedback" },
                      email: { $first: "$email" },
                      averageRating: { $avg: { $ifNull: ["$feedback.rating", 0] } }
                  }
                  },

                  {
                    $project: {
                        _id: 1,
                        name: 1,
                        userName: 1,
                        userType: 1,
                        firstName: 1,
                        lastName:1,
                        teachingCourse:1,
                        feedback:1,
                        email: 1, // Ensure you include the fields you need
                        averageRating: 1,
                        numberOfCourses: { $size: "$teachingCourse" }
                    }
                },
      
                  // Sort tutors by averageRating in descending order
                  { $sort: { averageRating: -1 } }
              ]).toArray();
      
              console.log("Tutors with average ratings:", tutors); // Log the tutors data
              return tutors;
          } catch (error) {
              console.error("Error in aggregation pipeline:", error); // Log any aggregation errors
              throw error; // Propagate the error
          }
      };
      
        
        
        
        
        
        
        
          
          
          
          
          
          
          
          
          
        
        
        
        
        
        
        
        





