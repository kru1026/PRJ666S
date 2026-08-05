// user-api/index.js

const express = require('express');
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');
dotenv.config();
const userService = require("./user-service.js");
const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const gfs = require('./user-service.js');
const fs = require('fs');
const path = require('path');
const { count } = require('console');
const docxConverter = require('docx-pdf');

const uploadDir = path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadDir));

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: process.env.JWT_SECRET,
};

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);

    if (jwt_payload) {

        next(null, {
            _id: jwt_payload._id,
            userName: jwt_payload.userName,
        });
    } else {
        next(null, false);
    }
});

passport.use(strategy);
app.use(passport.initialize());

app.post("/api/user/register", (req, res) => {
    userService.registerUser(req.body)
        .then((msg) => {
            res.json({ "message": msg });
        }).catch((msg) => {
            res.status(422).json({ "message": msg });
        });
});

app.post("/api/user/login", (req, res) => {
    userService.checkUser(req.body)
        .then((user) => {
            let payload = {
                _id: user._id,
                userName: user.userName,
            };
            let token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.json({ "message": "login successful", token: token, user: user });
        }).catch(msg => {
            res.status(422).json({ "message": msg });
        });
});

app.post("/api/user/reset-password", (req, res) => {
    const { userName, email, newPassword } = req.body;

    userService.resetPassword(userName, email, newPassword)
        .then(() => {
            res.json({ message: "Password updated successfully" });
        })
        .catch(msg => {
            res.status(422).json({ "message": msg });
        });
});

// app.post("/api/user/delete", (req, res) => {
//     const { userName, password } = req.body;

//     userService.deleteUser({ userName, password })
//     removeTutorFromCourses(userName)
//         .then((message) => {
//             res.json({ message });
//         })
//         .catch((err) => {
//             res.status(401).json({ message: err });
//         });
// });

app.post("/api/user/delete", async (req, res) => {
  try {
    const { userName, password } = req.body;

    await userService.removeTutorFromCourses(userName);

    const message = await userService.deleteUser({
      userName,
      password
    });

    res.json({ message });

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

app.get("/api/user/courses", (req, res) => {
    userService.getAllCourses()
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.put("/api/user/courses/:courseId", (req, res) => {
    const courseId = req.params.courseId;
    const updatedCourseData = req.body;

    userService.updateCourse(courseId, updatedCourseData)
        .then(updatedCourse => {
            res.json(updatedCourse);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.get("/api/user/users", (req, res) => {
    userService.getAllUsers()
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.put("/api/user/users/:userId", (req, res) => {
    const userId = req.params.userId;
    const editedUser = req.body;
    userService.updateUser(userId, editedUser)
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.put("/api/user/users/:userId/approvedPendingCourse", (req, res) => {
    const userId = req.params.userId;
    const courseId = req.body.courseId;
    userService.approvedPendingCourse(userId, courseId)
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.get("/api/user/tutors", (req, res) => {
    userService.getAllTutors()
        .then(tutors => {
            res.json(tutors);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.post("/api/user/courses/", (req, res) => {
    const newCourse = req.body;
    userService.createCourse(newCourse)
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.get("/api/user/courses/:courseCode", (req, res) => {
    const courseCode = req.params.courseCode;
    userService.getCourseByCode(courseCode)
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.post("/api/user/users/:userId/teachingCourse", (req, res) => {
    const userId = req.params.userId;
    const courseId = req.body.courseId;

    userService.addCourseToUserTeachingCourse(courseId, userId)
        .then(updatedCourse => {
            res.json(updatedCourse);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.put("/api/user/users/:userId/addApplyCourse", (req, res) => {
    const userId = req.params.userId;
    const courseId = req.body.courseId;

    userService.addCourseToUserPendingCourse(userId, courseId)
        .then(updatedCourse => {
            res.json(updatedCourse);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.put("/api/user/users/:userId/removeApplyCourse", (req, res) => {
    const userId = req.params.userId;
    const courseId = req.body.courseId;

    userService.removeCourseFromUserPendingCourse(userId, courseId)
        .then(updatedCourse => {
            res.json(updatedCourse);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.delete("/api/user/users/:userId/teachingCourse/:courseId", (req, res) => {
    const userId = req.params.userId;
    const courseId = req.params.courseId;

    userService.removeCourseToUserTeachingCourse(courseId, userId)
        .then(updatedCourse => {
            res.json(updatedCourse);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.post("/api/user/courses/:courseCode/tutors", (req, res) => {
    const courseCode = req.params.courseCode;
    const tutorId = req.body.tutorId;

    userService.addTutorToCourse(courseCode, tutorId)
        .then(updatedCourse => {
            res.json(updatedCourse);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.delete("/api/user/courses/:courseCode/tutors/:tutorId", (req, res) => {
    const courseCode = req.params.courseCode;
    const tutorId = req.params.tutorId;
  
    userService.removeTutorFromCourse(courseCode, tutorId)
      .then(updatedCourse => {
        if (updatedCourse) {
          res.json(updatedCourse);
        } else {
          res.status(200).json({ message: "Tutor removed successfully" });
        }
      })
      .catch(err => {
        res.status(422).json({ message: err });
      });
  });

app.get("/api/user/getUserByName/:userName", (req, res) => {
    const userName = req.params.userName;
    userService.getCurrentUser(userName)
        .then(user => {
            res.json(user);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.get("/api/user/getUserById/:userId", (req, res) => {
    const userId = req.params.userId;
    userService.getCurrentUserById(userId)
        .then(user => {
            res.json(user);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.post("/api/user/addCourseToCart", (req, res) => {
    userService.addCourseToCart(req.body)
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.get("/api/user/getAllCarts", (req, res) => {
    const userName = req.query.userName;
    userService.getAllCarts(userName)
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.post("/api/user/addCourseToUser", (req, res) => {
    userService.addCourseToUser(req.body)
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.delete("/api/user/deleteAllCartsFromOneUser", (req, res) => {
    const userName = req.query.userName;
    userService.deleteAllCartsFromOneUser(userName)
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.delete("/api/user/removeOneCourseFromCart", (req, res) => {
    const courseCode = req.query.courseCode;
    userService.removeOneCourseFromCart(courseCode)
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.post("/api/user/removeOneCourseFromUserPurchased", async (req, res) => {
    try {
        const result = await userService.removeOneCourseFromUserPurchased(req.body.userName, req.body.courseCode);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/user/createAppointment", (req, res) => {
    userService.createAppointment(req.body)
        .then((msg) => {
            res.json({ "message": msg });
        }).catch((msg) => {
            res.status(422).json({ "message": msg });
        });
});

app.delete("/api/user/deleteOneAppointment/:id", (req, res) => {
    const appointmentId = req.params.id; // Get the appointment ID from the URL parameter

    userService.deleteOneAppointment(appointmentId)
        .then((msg) => {
            res.json({ "message": msg });
        })
        .catch((msg) => {
            res.status(422).json({ "message": msg });
        });
});

app.get("/api/user/getAllAppointments", (req, res) => {
    userService.getAllAppointments()
    .then(appointments => {
        res.json(appointments);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});

app.get("/api/user/getAppointmentsForUser", (req, res) => {
    const userName = req.query.userName;
    userService.getAppointmentsForUser(userName)
    .then(appointments => {
        res.json(appointments);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});

app.get("/api/user/getAllCoursesFromOneUser", (req, res) => {
    const userName = req.query.userName;
    userService.getAllCoursesFromOneUser(userName)
    .then(courses => {
        res.json(courses);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});

app.get("/api/user/getTutorsByCourseCode", (req, res) => {
    const id = req.query.userId;
    const selectedCourse = req.query.selectedCourse;
    userService.getTutorsByCourseCode(id, selectedCourse)
    .then(tutors => {
        res.json(tutors);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});

app.get("/api/user/getRemainingHoursForOneCourse", (req, res) => {
    const userName = req.query.userName;
    const selectedCourse = req.query.selectedCourse;
    const tutor = req.query.selectedTutor;
    userService.getRemainingHoursForOneCourse(userName, selectedCourse, tutor)
    .then(remainingHours => {
        res.json(remainingHours);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});

app.put("/api/user/updateRemainingHours", (req, res) => {
    userService.updateRemainingHours(req.body._id, req.body.courseCode, req.body.taughtBy, req.body.remainingHours)
    .then(remainingHours => {
        res.json(remainingHours);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});

app.get("/api/user/getAllCoursesFromOneTutor", (req, res) => {
    const userName = req.query.userName;
    userService.getAllCoursesFromOneTutor(userName)
    .then(courses => {
        res.json(courses);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});

app.get("/api/user/getAllCoursesFromCourseCodes", (req, res) => {
    const courseCodes = req.query.courseCode.split(',');
    userService.getAllCoursesFromCourseCodes(courseCodes)
    .then(courses => {
        res.json(courses);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});

app.put("/api/user/createAvailability/", (req, res) => {
    const id = req.body._id;
    const startTime = req.body.availability.startTime;
    const endTime = req.body.availability.endTime;
    userService.createAvailability(id, startTime, endTime)
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.delete("/api/user/deleteOneAvailability/", (req, res) => {
    const id = req.query.id;
    console.log(id);
    userService.deleteOneAvailability(id)
        .then(courses => {
            res.json(courses);
        })
        .catch(err => {
            res.status(422).json({ "message": err });
        });
});

app.post("/api/user/submitFeedback", (req, res) => {
    const { sessionId, selectedCourse, tutorId, rating, feedbackNote } = req.body;
  
    const feedbackData = {
      sessionId,
      courseCode: selectedCourse,
      rating,
      feedbackNote,
    };
  
    // Find tutor by tutorId and add feedback
    userService.addRatingToTutorById(tutorId, feedbackData)
      .then(() => {
        res.json({ message: "Feedback submitted successfully" });
      })
      .catch(err => {
        res.status(422).json({ message: err });
      });
  });
  
  app.get("/api/user/getMostPurchasedCourses", (req, res) => {
    userService.getMostPurchasedCourses()
    .then(courses => {
        res.json(courses);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});  

app.get("/api/user/getMostRatedCourses", (req, res) => {
    userService.getMostRatedCourses()
    .then(courses => {
        res.json(courses);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});  

app.get("/api/user/getAllCoursesWithRatings", (req, res) => {
    userService.getCoursesWithRatings()
    .then(courses => {
        res.json(courses);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
}); 

app.get("/api/user/getPurchasedCount", (req, res) => {
    userService.getPurchasedCount(req.query.courseCode)
    .then(count => {
        res.json(count);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
}); 

app.get("/api/user/courseRatings", (req, res) => {
    const userId = req.query.userId;
    const courseCode = req.query.courseCode;

    userService.getRatings(userId, courseCode)
    .then(ratings => {
        res.json(ratings);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
});

const setUserIdQueryParam = (req, res, next) => {
    req.query.userId = req.params.id;
    next();
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save the uploaded files
    },
    filename: (req, file, cb) => {
        const userId = req.query.userId; // Get userId from request body
        const originalFileName = file.originalname; // Get the original file name
        const timestamp = Date.now();
        // Create a unique name using userId and original filename
        const uniqueName = `${userId}-${timestamp}-${originalFileName}`;
        cb(null, uniqueName); // Store the file with this unique name
    }
});

const upload = multer({ storage: storage });

const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploadImages/'); // Directory to save the uploaded files
    },
    filename: (req, file, cb) => {
        const userId = req.query.userId; // Get userId from request body
        const originalFileName = file.originalname; // Get the original file name
        const timestamp = Date.now();
        // Create a unique name using userId and original filename
        const uniqueName = `${userId}`;
        cb(null, uniqueName); // Store the file with this unique name
    }
});

const upload2 = multer({ storage: storage2 });

app.post('/api/user/upload/:id', setUserIdQueryParam, upload.single('file'), (req, res) => {
    
    if (!req.file) {
        console.error("No file uploaded.");
        return res.status(400).json({ error: 'File not uploaded' });
    }
    const originalFileName = req.file.originalname;
    res.json({ message: 'File uploaded successfully', fileName: req.file.filename });
});

app.post('/api/user/uploadImg/:id', setUserIdQueryParam, upload2.single('file'), (req, res) => {
    
    if (!req.file) {
        console.error("No image uploaded.");
        return res.status(400).json({ error: 'Image not uploaded' });
    }
    const originalFileName = req.file.originalname;
    res.json({ message: 'Image uploaded successfully', fileName: req.file.filename });
});

app.get('/api/user/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename); // Adjust this path as necessary
    //const filePath2 = './uploads/javaScript.jpg'; 
    res.download(filePath, (err) => {
        if (err) {
            console.error("Error downloading file:", err);
            res.status(404).send('File not found');
        }
    });
});

app.get('/api/user/OpenPDF/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename); // Adjust this path as necessary

    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("Error downloading file:", err);
            res.status(404).send('File not found');
        }
    });
});

app.get('/api/user/OpenWord/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Backup the original file with the same name (no need to change the name for backup)
    const backupFilePath = path.join(__dirname, 'uploads', `backup-${filename}`);
    
    // Create a backup of the original file with the same name
    fs.copyFile(filePath, backupFilePath, (err) => {
        if (err) {
            console.error('Error creating backup file:', err);
            return res.status(500).send('Failed to create backup');
        }

        // Proceed with the conversion to PDF
        const outputFilePath = path.join(__dirname, 'uploads', `${path.parse(filename).name}.pdf`);

        // Convert the .docx to .pdf
        docxConverter(filePath, outputFilePath, (err, result) => {
            if (err) {
                console.error('Error converting file:', err);
                return res.status(500).send('Conversion failed');
            }

            // Send the converted PDF to the user
            res.sendFile(outputFilePath, (err) => {
                if (err) {
                    console.error("Error sending file:", err);
                    res.status(404).send('File not found');
                } else {
                    // File has been successfully sent, delete the converted file
                    fs.unlink(outputFilePath, (err) => {
                        if (err) {
                            console.error("Error deleting converted file:", err);
                        } else {
                            console.log('Converted file deleted successfully');
                        }
                    });
                }
            });
        });
    });
});

app.get('/api/user/OpenImg/:filename', async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename); // Adjust this path as necessary
    //const filePath2 = './uploads/javaScript.jpg'; 
    try {
        const mime = await import('mime');  // Dynamic import
        const mimeType = mime.default.getType(filePath);  // Use mime.default for compatibility

        res.setHeader('Content-Type', mimeType);
        res.sendFile(filePath, (err) => {
            if (err) {
                res.status(404).send('File not found');
            }
        });
    } catch (err) {
        res.status(500).send('Error loading MIME module');
    }
});

app.get('/api/user/OpenPhoto/:filename', async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploadImages', filename); // Adjust this path as necessary
    //const filePath2 = './uploads/javaScript.jpg'; 
    try {
        const mime = await import('mime');  // Dynamic import
        const mimeType = mime.default.getType(filePath);  // Use mime.default for compatibility

        res.setHeader('Content-Type', mimeType);
        res.sendFile(filePath, (err) => {
            if (err) {
                res.status(404).send('File not found');
            }
        });
    } catch (err) {
        res.status(500).send('Error loading MIME module');
    }
});

app.get('/api/user/getFiles', (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploads'); // Adjust path if necessary
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error("Error reading uploads directory:", err);
            return res.status(500).json({ error: 'Failed to retrieve files' });
        }

        // Map file names to include a full URL (or relative path) if needed
        const fileList = files.map(file => ({
            name: file,
            url: `/uploads/${file}` // Assuming you want to construct a URL for accessing the file
        }));

        res.json(fileList); // Send the list of files to the frontend
    });
});

app.get('/api/user/getPhoto', (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploadImages'); // Adjust path if necessary
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error("Error reading uploads directory:", err);
            return res.status(500).json({ error: 'Failed to retrieve files' });
        }

        // Map file names to include a full URL (or relative path) if needed
        const fileList = files.map(file => ({
            name: file,
            url: `/uploadImages/${file}` // Assuming you want to construct a URL for accessing the file
        }));

        res.json(fileList); // Send the list of files to the frontend
    });
});

app.delete('/api/user/deleteFile', (req, res) => {
    const { fileName } = req.query;

    // Define the path to the file in the 'uploads' directory
    const filePath = path.join(__dirname, 'uploads', fileName);

    try {
        // Synchronously delete the file
        fs.unlinkSync(filePath);  // Note: unlinkSync for simplicity in try-catch

        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Failed to delete file111" });
    }
});

app.delete('/api/user/deletePhoto', (req, res) => {
    const { fileName } = req.query;

    // Define the path to the file in the 'uploads' directory
    const filePath = path.join(__dirname, 'uploadImages', fileName);

    try {
        // Synchronously delete the file
        fs.unlinkSync(filePath);  // Note: unlinkSync for simplicity in try-catch

        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Failed to delete file111" });
    }
});

app.get("/api/user/getAllCoursesWithRating", (req, res) => {
    userService.getAllCoursesWithRating2()
    .then(courses => {
        res.json(courses);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
}); 

app.get("/api/user/getTutorsWithAvgRating", (req, res) => {
    userService.getTutorsWithAvgRating()
    .then(tutors => {
        res.json(tutors);
    })
    .catch(err => {
        res.status(422).json({ "message": err });
    });
}); 


userService.connect()
    .then(() => {
        app.listen(HTTP_PORT, () => { console.log("API listening on: " + HTTP_PORT) });
    })
    .catch((err) => {
        console.log("unable to start the server: " + err);
        process.exit();
    });

