// my-app/pages/profile/[userId].js

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getToken, getAllCourses } from '@/lib/authenticate';
import { getUserById, updateUser, addApplyCourse, removeApplyCourse, removeCourseToUserTeachingCourse } from '../api/user';
import { removeTutorFromCourse } from '@/pages/api/course';
import CourseCardList from '@/components/CourseCardList';
import { Button, Col, Row } from "react-bootstrap";
import { Card } from 'react-bootstrap';

export default function Profile() {
  const router = useRouter();
  const token = getToken();
  const { userId } = router.query;

  // if (!token) {
  //   router.push('/login');
  // }

  localStorage.setItem('viewingUserId', userId);
  const viewingUserId = localStorage.getItem('viewingUserId');

  const [error, setError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user')); // Changed currentUser to currentUser
  const [user, setUser] = useState({});
  const [editedUser, setEditedUser] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditCourse, setIsEditCourse] = useState(false);
  const [courseList, setCourseList] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [selectedSort, setSelectedSort] = useState('default');
  const [files, setFiles] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (storedUser) {
      setLoggedIn(true);
    }
  }, []);

  const fetchOneUser = async () => {
    try {
      const userRes = await getUserById(userId);
      setUser(userRes);
      setEditedUser({ ...userRes });
      console.log("User Data: ", userRes);
      const courseRes = await getAllCourses();
      setCourseList(courseRes);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOneUser();
    }
  }, [userId]);

  const handleEnableEdit = () => {
    setIsEditMode(true);
    setIsEditCourse(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedUser({ ...user });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await updateUser(userId, editedUser);
      setUser(editedUser);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleInputChange = (event, fieldName) => {
    setEditedUser({ ...editedUser, [fieldName]: event.target.value });
  };

  const handleOpenEditCourseList = () => {
    setIsEditCourse(true);
    setIsEditMode(false);
  };

  const handleCloseEditCourseList = () => {
    setIsEditCourse(false);
  };

  const handleAddApplyCourse = async (courseInfo) => {
    try {
      await addApplyCourse(userId, courseInfo._id);
      const temp = { ...user };
      temp.pendingCourse.push(courseInfo._id);
      setUser(temp);
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const handleRemoveApplyCourse = async (courseInfo) => {
    try {
      await removeApplyCourse(userId, courseInfo._id);
      const temp = { ...user };
      temp.pendingCourse = temp.pendingCourse.filter(
        (courseId) => courseId !== courseInfo._id
      );
      setUser(temp);
    } catch (error) {
      console.error("Error removing course:", error);
    }
  };

  const handleRemoveCourse = async (courseInfo) => {
    try {
      await removeTutorFromCourse(courseInfo._id, user._id);
      await removeCourseToUserTeachingCourse(user._id, courseInfo._id);

      const userTemp = { ...user };
      userTemp.teachingCourse = userTemp.teachingCourse.filter(
        (course) => course._id !== courseInfo._id
      );
      setUser(userTemp);

      const courseListTemp = courseList.map((course) => {
        if (course._id === courseInfo._id) {
          return {
            ...course,
            assignedTutors: course.assignedTutors.filter(
              (tutorId) => tutorId !== user._id
            ),
          };
        }
        return course;
      });

      setCourseList(courseListTemp);
      console.log('Tutor removed successfully');
    } catch (error) {
      console.error('Error removing tutor:', error);
    }
  };

  // Calculate the average rating
  const calculateAverageRating = (feedback) => {
    if (!feedback || feedback.length === 0) return 0;
    const totalRating = feedback.reduce((acc, curr) => acc + curr.rating, 0);
    return (totalRating / feedback.length).toFixed(1); // Rounded to 1 decimal place
  };

  // Render stars based on the rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gold" className="bi bi-star-fill" viewBox="0 0 16 16">
            <path d="M3.612 15.443c-.396.197-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.396.73-.396.927 0l2.184 4.327 4.898.696c.441.062.612.63.283.95l-3.523 3.356.83 4.73c.078.443-.35.789-.746.592L8 13.187l-4.389 2.256z" />
          </svg>
        ) : (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" className="bi bi-star" viewBox="0 0 16 16">
            <path d="M2.866 14.85c-.078.443.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.15.746-.592l-.83-4.73 3.523-3.356c.329-.32.158-.888-.283-.95l-4.898-.696L8.465.792c-.197-.396-.73-.396-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.63-.283.95l3.523 3.356-.83 4.73z" />
          </svg>
        )
      );
    }
    return stars;
  };

  useEffect(() => {
    const fetchFiles = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getPhoto`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const fileList = await response.json();
            const userFiles = fileList.filter(file => file.name.startsWith(viewingUserId));
            setFiles(userFiles);
        } catch (err) {
            console.error('Error fetching files:', err);
            setError('Unable to fetch files');
        }
    };

    fetchFiles();
}, []);

const [height, setHeight] = useState(200);

    const handleClick = () => {
        setHeight(prevHeight => (prevHeight === 200 ? 500 : 200));
    };

    const deletePhoto = async (fileName) => {
      try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deletePhoto?fileName=${fileName}`, {
              method: 'DELETE',
          });
          
          if (response.ok) {
              setFiles(files.filter(file => file.name !== fileName));
              alert("File deleted successfully");
          } else {
              console.error("Failed to delete file");
              alert("There is an error deleting the file");
          }
      } catch (error) {
          console.error("An error occurred:", error);
          alert("There is an error deleting the file");
      }
  }; 


  return (
    <>
      {user.userType === "tutor" && (<div style={{ textAlign: 'right' }}>
        <Button href={`/tutor/${userId}`} style={{ width: '170px', height: '40px' }}>Tutor Availability</Button>
      </div>)}{user.userType === "tutor" &&  <br />}

      {user.userType === "tutor" && (<div style={{ textAlign: 'right' }}>
        <Button href={`../download`} style={{ width: '170px', height: '40px' }}>Tutor Certificates</Button>
      </div>)}{user.userType === "tutor" &&  <br />}

      {user && currentUser && user.userType === "tutor" && user._id == currentUser._id && (<div style={{ textAlign: 'right' }}>
        <Button href={`../upload`} style={{ width: '170px', height: '40px' }}>Upload Certificates</Button>
      </div>)}{user&& currentUser&& user.userType === "tutor" && user._id == currentUser._id &&  <br />}

      {/* {user._id == currentUser._id && files.length == 0 && (<div style={{ textAlign: 'right' }}>
        <Button href={`../uploadImg`} style={{ width: '170px', height: '40px' }}>Upload a Photo</Button>
      </div>)}{user._id == currentUser._id && files.length == 0 && <br />} */}

      {user._id === currentUser?._id && files.length === 0 && (
          <div style={{ textAlign: 'right' }}>
            <Button
              href="../uploadImg"
              style={{ width: '170px', height: '40px' }}
            >
              Upload a Photo
            </Button>
          </div>
        )}

      {user._id === currentUser?._id && files.length === 0 && <br />}

      {user && currentUser && files && files.length > 0 && user._id === currentUser._id && (
        <div style={{ textAlign: 'right' }}>
        <Button 
            style={{ width: '170px', height: '40px' }} 
            onClick={() => deletePhoto(files[0].name)}
        >
        Delete the Photo
        </Button>
        </div>
        )}{user && currentUser && files && files.length > 0 && user._id === currentUser._id && <br />}

      {/* {user._id == currentUser._id && user.userType == "student" && (<div style={{ textAlign: 'right' }}>
        <Button href={`../historyOrder`} style={{ width: '170px', height: '40px' }}>List of Courses</Button>
      </div>)}{user._id == currentUser._id && user.userType == "student" && <br />} */}

     {currentUser &&
        user._id === currentUser._id &&
        user.userType === "student" && (
          <>
            <div style={{ textAlign: "right" }}>
              <Button
                href="../historyOrder"
                style={{ width: "170px", height: "40px" }}
              >
                List of Courses
              </Button>
            </div>
            <br />
          </>
      )}
     
     {user && currentUser && user._id == currentUser._id && user.userType == "student" && <br />}

      {/* {user && user._id == currentUser._id && user.userType == "student" ? */}
      {user && currentUser && user._id === currentUser._id && user.userType === "student" ?
        <div className="card p-2" style=
          {{ border: 'none' }}>
          <div className="card-body shadow-sm position-relative">
            <div>
              {isEditMode ? (
                <>
                  <div className='d-flex align-items-center my-1'>
                    <label for="basic-url" className="form-label align-middle mx-2">First Name: </label>
                    <input className="form-control" type="text" defaultValue={editedUser.firstName} onChange={(e) => handleInputChange(e, 'firstName')} style={{ maxWidth: '200px' }} />
                  </div>
                  <div className='d-flex align-items-center my-1'>
                    <label for="basic-url" className="form-label align-middle mx-2">Last Name: </label>
                    <input className="form-control" type="text" defaultValue={editedUser.lastName} onChange={(e) => handleInputChange(e, 'lastName')} style={{ maxWidth: '200px' }} />
                  </div>
                  <div className='d-flex align-items-center my-1'>
                    <label for="basic-url" className="form-label align-middle mx-2">Institution: </label>
                    <input className="form-control" type="text" defaultValue={editedUser.institution} onChange={(e) => handleInputChange(e, 'institution')} style={{ maxWidth: '200px' }} />
                  </div>
                  <div className='d-flex align-items-center my-1'>
                    <label for="basic-url" className="form-label align-middle mx-2">Program: </label>
                    <input className="form-control" type="text" defaultValue={editedUser.program} onChange={(e) => handleInputChange(e, 'program')} style={{ maxWidth: '200px' }} />
                  </div>
                  <div>
                    <div className='d-flex align-items-center my-1'>
                      <label for="basic-url" className="form-label align-middle mx-2">Location </label>
                      <input className="form-control" type="text" defaultValue={editedUser.baseLocation} onChange={(e) => handleInputChange(e, 'baseLocation')} style={{ maxWidth: '200px' }} />
                    </div>
                  </div>
                  <div className='d-flex align-items-center my-1' >
                    <label for="basic-url" className="form-label align-middle mx-2">Description </label>
                    <input className="form-control" type="text" defaultValue={editedUser.selfDescription} onChange={(e) => handleInputChange(e, 'selfDescription')} />
                  </div>
                  <div className='position-absolute top-0 end-0 m-3'>
                    <button onClick={() => handleSaveEdit()} type="button" className="btn btn-info btn-sm">
                      Save
                    </button>
                    <button onClick={() => handleCancel()} type="button" className="btn btn-danger btn-sm align-middle shadow-sm mx-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="card-title">
                    {user && user.userName && `${user.userName}`}
                    {user && user.firstName && user.lastName && ` - ${user.firstName} ${user.lastName}`}
                  </h4>
                  <Row>
                {files.length > 0 ? (
                    files.map((file) => (
                        <Col key={file.storedFileName} xs={12} md={6} className="mb-4">
                            <Card className="shadow-sm h-100 border-0" style={{ transition: 'transform 0.3s' }}>
                                <Card.Body>
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/OpenPhoto/${file.name}`} height={height} alt={`${file.name} photo`} onClick={handleClick} style={{ cursor: 'pointer' }}/>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <h6 className="mt-3 mb-3">You do not have a photo uploaded</h6>
                    </Col>
                )}
            </Row>
                  <h6>
                    {user && user.institution && `${user.institution}`}
                  </h6>
                  <h6>
                    {user && user.program && `${user.program}`}
                  </h6>
                  <div className="d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-geo-alt align-middle" viewBox="0 0 15 15">
                      <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
                      <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                    </svg>
                    <h6 className="align-middle">
                      {user && user.baseLocation ? `${user.baseLocation}` : ""}
                    </h6>
                  </div>
                  {/* <h className="my-3">Overview</h5> */}
                  <h6>
                    {user && user.selfDescription ? user.selfDescription : ""}
                  </h6>
                  {user.userType === "student" && user.purchasedCourse && (
        <div>
          <h6>Number of purchased courses: {user.purchasedCourse.length}</h6>
        </div>
      )}
                  {user._id === currentUser._id ?
                    <button onClick={() => handleEnableEdit()} type="button" className="btn btn-light btn-sm align-middle shadow-sm position-absolute top-0 end-0 m-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                      </svg>
                    </button>
                    : <></>
                  }
                </>
              )}
            </div>
          </div >
        </div >
        :
        <div className="card p-2" style={{ border: 'none' }}>
          <div className="card-body shadow-sm position-relative">
            <div>
              {isEditMode ? (
                <>
                  <div className='d-flex align-items-center my-1'>
                    <label for="basic-url" className="form-label align-middle mx-2">First Name: </label>
                    <input className="form-control" type="text" defaultValue={editedUser.firstName} onChange={(e) => handleInputChange(e, 'firstName')} style={{ maxWidth: '200px' }} />
                  </div>
                  <div className='d-flex align-items-center my-1'>
                    <label for="basic-url" className="form-label align-middle mx-2">Last Name: </label>
                    <input className="form-control" type="text" defaultValue={editedUser.lastName} onChange={(e) => handleInputChange(e, 'lastName')} style={{ maxWidth: '200px' }} />
                  </div>
                  <div className='d-flex align-items-center my-1'>
                    <label for="basic-url" className="form-label align-middle mx-2">Job Title: </label>
                    <input className="form-control" type="text" defaultValue={editedUser.jobTitle} onChange={(e) => handleInputChange(e, 'jobTitle')} style={{ maxWidth: '200px' }} />
                  </div>
                  <div>
                    <div className='d-flex align-items-center my-1'>
                      <label for="basic-url" className="form-label align-middle mx-2">Location </label>
                      <input className="form-control" type="text" defaultValue={editedUser.baseLocation} onChange={(e) => handleInputChange(e, 'baseLocation')} style={{ maxWidth: '200px' }} />
                    </div>
                  </div>
                  <div className='d-flex align-items-center my-1' >
                    <label for="basic-url" className="form-label align-middle mx-2">Description </label>
                    <input className="form-control" type="text" defaultValue={editedUser.selfDescription} onChange={(e) => handleInputChange(e, 'selfDescription')} />
                  </div>
                  <div className='position-absolute top-0 end-0 m-3'>
                    <button onClick={() => handleSaveEdit()} type="button" className="btn btn-info btn-sm">
                      Save
                    </button>
                    <button onClick={() => handleCancel()} type="button" className="btn btn-danger btn-sm align-middle shadow-sm mx-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="card-title">
                    {user && user.userName && `${user.userName}`}
                    {user && user.firstName && user.lastName && ` - ${user.firstName} ${user.lastName}`}
                  </h4>
                  <Row>
                {files.length > 0 ? (
                    files.map((file) => (
                        <Col key={file.storedFileName} xs={12} md={6} className="mb-4">
                            <Card className="shadow-sm h-100 border-0" style={{ transition: 'transform 0.3s' }}>
                                <Card.Body>
                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/OpenPhoto/${file.name}`} height={height} alt={`${file.name} photo`} onClick={handleClick} style={{ cursor: 'pointer' }}/>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <h6 className="mb-3 mt-3">You do not have a photo uploaded</h6>
                    </Col>
                )}
            </Row>
                  <h6>
                    {user && user.jobTitle ? user.jobTitle : ""}
                  </h6>
                  <div className="d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-geo-alt" viewBox="0 0 15 15">
                      <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
                      <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                    </svg>
                    <h6 className="align-middle">
                      {user && user.baseLocation ? `${user.baseLocation}` : ""}
                    </h6>
                  </div>
                  {/* <h4 className="my-3">Overview</h4> */}
                  <h6>
                    {user && user.selfDescription ? user.selfDescription: ""} <br />
                  </h6>
                  {user.userType === "tutor" && user.teachingCourse && (
        <div>
          <h6>Number of teaching courses: {user.teachingCourse.length}</h6>
        </div>
      )}

      {/* Display tutor's average rating */}
      {user.userType === "tutor" && user.feedback && (
        <div>
          <h6>Average Rating: </h6>
          <div className="d-flex align-items-center">
            <div>{renderStars(calculateAverageRating(user.feedback))}</div>
            <span className="mx-2">{calculateAverageRating(user.feedback)} / 5</span>
          </div>
        </div>
      )}
                  {user && currentUser && user._id === currentUser._id ?
                    <button onClick={() => handleEnableEdit()} type="button" className="btn btn-light btn-sm align-middle shadow-sm position-absolute top-0 end-0 m-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                      </svg>
                    </button>
                    : <></>
                  }
                </>
              )}
            </div>
          </div >
        </div >
      }
      {!loggedIn ? (
        <div className="card w-100 mt-4" style={{ border: 'none' }}>
          <h3 className="card-body">
            Please log in to view courses taught by this tutor and their feedback.
          </h3>
        </div>
      ) : (
      <>
      {user && currentUser && (user._id != currentUser._id || user.userType != "student") ?
        <>
          {/* <div className="modal fade position-absolute top-50 start-50" aria-labelledby="exampleModalLabel" aria-hidden="false" style={{ display: isEditCourse ? 'contents' : 'none', zIndex: 5 }}> */}
          <div
            className={`modal fade ${isEditCourse ? 'show' : ''}`}
            aria-labelledby="exampleModalLabel"
            aria-hidden={!isEditCourse}
            style={{
              display: isEditCourse ? 'block' : 'none',
              zIndex: 1050
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable rounded" style={{ zIndex: 5 }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">
                    Edit Course List
                  </h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => handleCloseEditCourseList()}></button>
                </div>
                <div className="modal-body">
                  <input type="text" className="form-control" placeholder="Course Code" value={courseName} onChange={(e) => setCourseName(e.target.value)}></input>
                  <ul className="list-group my-2" style={{ maxHeight: "250px", overflowY: 'scroll' }}>
                    {/* courses */}
                     {courseList && courseList.filter((course) => course.courseCode.toLowerCase().includes(courseName.toLowerCase())).length > 0 ? (
                      courseList
                        .filter((course) => course.courseCode.toLowerCase().includes(courseName.toLowerCase()))
                        .map((course) => (
                          <li className="list-group-item d-flex justify-content-between align-items-center" key={course._id}>
                            <div>{course.courseCode}</div>
                            {course.assignedTutors.includes(user._id) ? (
                              <button onClick={() => handleRemoveCourse(course)} type="button" className="btn btn-danger btn-sm align-middle">Remove</button>
                            ) : (
                              user.pendingCourse.includes(course._id) ? (
                                <div>
                                  <button type="button" className="btn btn-light btn-sm align-middle" disabled>Pending</button>
                                  <button onClick={() => handleRemoveApplyCourse(course)} type="button" className="btn btn-danger btn-sm align-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 15 15">
                                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => handleAddApplyCourse(course)} type="button" className="btn btn-primary btn-sm align-middle">Apply</button>
                              )
                            )}
                          </li>
                        ))
                    ) : (
                      <li className="list-group-item">No Courses.</li>
                    )}
                  </ul>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary mx-auto" data-bs-dismiss="modal" onClick={() => handleCloseEditCourseList()}>Close</button>
                </div>
              </div>
            </div>
          </div>
          <div className="card w-100 mt-4" style={{ border: 'none' }}>
            <div className="container-fluid">
              <div className="row">
                <div className="col d-flex">
                  <h3 className="card-title">Courses</h3>
                  {user && user._id == currentUser._id && user.userType == "tutor" ?
                    <button onClick={() => handleOpenEditCourseList()} type="button" className="btn mx-4 btn-light btn-sm align-middle shadow-sm">Edit Course List</button>
                    : ""
                  }
                </div>
                <div className="col text-end">
                  <select className="form-select" value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
                    <option value="default">Default</option>
                    <option value="courseCode">Course Code</option>
                    <option value="courseName">Course Name</option>
                    {/* <option value="published">Published Status</option> */}
                    {/* Add more sort options as needed */}
                  </select>
                </div>
              </div>
            </div>
            <div className="container-fluid">
              {user && user.teachingCourse && user.teachingCourse.length > 0 ? (
                user.teachingCourse.slice().sort((a, b) => {
                  switch (selectedSort) {
                    case "courseCode":
                      return a.courseCode.localeCompare(b.courseCode);
                    case "courseName":
                      return a.courseName.localeCompare(b.courseName);
                    case "published":
                      return a.published - b.published;
                    default:
                      return 0;
                  }
                }).map((course) => (
                  <>
                    <span className="mx-2">
                      <CourseCardList key={course._id} course={course} />
                    </span>
                  </>
                ))
              ) : (
                <p>You have no courses assigned.</p>
              )}
              {user.userType === "tutor" && user.feedback && user.feedback.length > 0 &&(
                <>
                  <br /><br /><h2>Students' Feedback for this Tutor</h2><br />
                  {user.feedback.map((feedback) => (
                    <Card key={feedback._id} className="mb-3">
                      <Card.Body>
                        <Card.Text>
                          <strong>Course: {feedback.courseCode}</strong><br />
                          <strong>Session ID: {feedback.sessionId}</strong><br />
                          <strong>Rating: {feedback.rating}/5 </strong><br />
                          <div>{renderStars(feedback.rating)}</div>
                          <strong>Comments: {feedback.feedbackNote} </strong>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  ))}
                </>
              )}

            </div>
          </div>
          {/* <!-- Modal --> showCourseListModel */}
          {/* <div className="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"> */}
          {/* position-absolute top-50 start-50 */}
        </>
        :
        <></>
      }</>
      )}</>
  );
};
