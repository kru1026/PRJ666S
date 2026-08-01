// my-app/pages/admin.js

import { useState, useEffect } from 'react';
import { getAllCourses, getToken } from '@/lib/authenticate';
import { getAllUser, getAllTutors, addCourseToUserTeachingCourse, removeCourseToUserTeachingCourse, updatePendingCourse } from '@/pages/api/user';
import { updateCourse, addTutorToCourse, removeTutorFromCourse, createCourse } from '@/pages/api/course';
// import styles from '@/styles/Admin.module.css';

const PER_PAGE = 10;
const MAX_VISIBLE_PAGES = 10;

export default function Admin() {

  const [activeTab, setActiveTab] = useState('user');

  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [tutors, setTutors] = useState([]);

  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumbers, setPageNumbers] = useState([]);
  const [paginatedData, setpaginatedData] = useState([]);

  const [itemID, setItemID] = useState(null);
  const [updatedCourse, setUpdatedCourse] = useState(null);
  const [tempCourse, setTempCourse] = useState(null);

  const [showAssignedModel, setShowAssignedModel] = useState(false);
  const [assignedCourse, setAssignedCourse] = useState(null);
  const [tutorName, setTutorName] = useState('');

  const [showAddModel, setShowAddModel] = useState(false);
  const [tempNewCourse, setTempNewCourse] = useState({
    courseCode: "",
    courseName: "",
    courseImgUrl: "",
    coursePrice: "",
    institution: "",
    description: "",
    published: true,
    assignedTutors: []
  });

  const [showPendingModel, setShowPendingModel] = useState(false);
  const [tempTutor, setTempTutor] = useState({});
  const [InstitutionList, setInstitutionList] = useState(["N/A", "Seneca Polytechnic", "George Brown College", "Centennial College"]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUser();
      console.log(data)
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTutors = async () => {
    try {
      const data = await getAllTutors();
      setTutors(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    pagination();
    fetchTutors();
  }, []);

  useEffect(() => {
    // fetchTutors();
    fetchCourses();
  }, [assignedCourse]);

  const handleTabClick = async (tabId) => {
    handleCloseAssignedModel();
    setActiveTab(tabId);
    setCurrentPage(1);
    pagination();
    disabledEdit();
    handleClosePending(false)
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber == currentPage) {
      return
    }
    setCurrentPage(pageNumber);
    pagination();
    disabledEdit();
  };

  const handleShowAssignedModel = (course) => {
    setAssignedCourse(course)
    setShowAssignedModel(true);
  }

  const handleCloseAssignedModel = () => {
    setAssignedCourse(null)
    setShowAssignedModel(false);
  }

  useEffect(() => {
    const data = activeTab === "user" ? users : courses;
    setpaginatedData(data.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE))
    pagination();
  }, [activeTab, currentPage, totalPages, courses, tempTutor]);

  function pagination() {
    const data = activeTab == "user" ? users : courses
    setTotalPages(Math.ceil(data.length / PER_PAGE))
    const pageNumbersTemp = [];

    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbersTemp.push(i);
      }
      setPageNumbers(pageNumbersTemp)
    } else {
      const leftBoundary = Math.max(currentPage - Math.floor(MAX_VISIBLE_PAGES / 2), 1);
      const rightBoundary = Math.min(currentPage + Math.floor(MAX_VISIBLE_PAGES / 2), totalPages);

      const shouldShowLeftEllipsis = leftBoundary > 2;
      const shouldShowRightEllipsis = rightBoundary < totalPages - 1;

      if (shouldShowLeftEllipsis) {
        pageNumbersTemp.push(1);
        pageNumbersTemp.push('...');
      }

      for (let i = leftBoundary; i <= rightBoundary; i++) {
        pageNumbersTemp.push(i);
      }

      if (shouldShowRightEllipsis) {
        pageNumbersTemp.push('...');
        pageNumbersTemp.push(totalPages);
      }
      setPageNumbers(pageNumbersTemp)
    }

    setpaginatedData(data.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE));
  }

  const handleEnableEdit = (course) => {
    setTempCourse(course)
    handleCloseAssignedModel()
    setItemID(course._id)
  };

  const handleCancelEdit = () => {
    setTempCourse(null)
    setItemID(null)
  };

  const handleRemoveAssignedTutor = async (tutor) => {
    console.log(assignedCourse._id, tutor)
    try {
      const updatedCourse = await removeTutorFromCourse(assignedCourse._id, tutor._id);
      removeCourseToUserTeachingCourse(tutor._id, assignedCourse._id)
      setAssignedCourse(updatedCourse);

      console.log('Tutor removed successfully:', updatedCourse);
    } catch (error) {
      console.error('Error removing tutor:', error);
    }
  };

  const handleAddAssignedTutor = async (tutor) => {
    try {
      const updatedCourse = await addTutorToCourse(assignedCourse._id, tutor._id);
      //addCourseToUserTeachingCourse(tutor._id, assignedCourse._id)

      await updatePendingCourse(tutor._id, assignedCourse._id);

      setAssignedCourse(updatedCourse);
      console.log('Tutor added successfully:', updatedCourse);
      window.location.reload();
      
    } catch (error) {
      console.error('Error adding tutor:', error);
    }
  };

  const handleInputChange = (event, fieldName, course) => {
    console.log(fieldName)
    if (fieldName === 'published') {
      // setUpdatedCourse({ ...updatedCourse, [fieldName]: !course.published });
      setTempCourse({ ...tempCourse, [fieldName]: !course.published });
    } else {
      // setUpdatedCourse({ ...updatedCourse, [fieldName]: event.target.value });
      setTempCourse({ ...tempCourse, [fieldName]: event.target.value });
    }
  };

  const disabledEdit = () => {
    setItemID(null);
    setUpdatedCourse(null);
  }

  const handleSaveEdit = async (courseId) => {
    try {
      const updatedCourses = [...courses];
      const courseIndex = updatedCourses.findIndex((course) => course._id === courseId);
      // console.log(courseId);
      // console.log(updatedCourse);

      // const updatedCourseData = { ...updatedCourses[courseIndex], ...updatedCourse };
      const updatedCourseResponse = await updateCourse(courseId, tempCourse);

      updatedCourses[courseIndex] = updatedCourseResponse;
      setCourses(updatedCourses);

      // setItemID(null);
      // setUpdatedCourse(null);
      disabledEdit();
      setTempCourse(null);
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const handleNewCourse = () => {
    const newCourse = {
      courseCode: "",
      courseName: "",
      courseImgUrl: "",
      coursePrice: "",
      institution: "",
      description: "",
      published: true,
      assignedTutors: []
    };
    setShowAddModel(true)
    setTempNewCourse(newCourse)
  };

  const handleCloseNewCourse = () => {
    setShowAddModel(false)
  };

  const handleShowPending = (tutor) => {
    setTempTutor(tutor)
    setShowPendingModel(true)
  };

  const handleClosePending = () => {
    setShowPendingModel(false)
  };

  const handleApprovedPendingCourse = async (courseInfo) => {
    try {
      await updatePendingCourse(tempTutor._id, courseInfo._id);
      await addTutorToCourse(courseInfo._id, tempTutor._id);

      const tempUser = { ...tempTutor };
      tempUser.pendingCourse = tempUser.pendingCourse.filter(
        (course) => course._id !== courseInfo._id
      );

      setTempTutor(tempUser);
      setUsers(users.map((user) => (user._id === tempUser._id ? tempUser : user)));
      window.location.reload();
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const handleInputChangeCourse = (event, fieldName) => {
    setTempNewCourse({
      ...tempNewCourse,
      [fieldName]: event.target.value,
    });
  };

  const handleAddNewCourse = async () => {
    console.log(tempNewCourse)
    if (!tempNewCourse.courseCode || !tempNewCourse.courseName || !tempNewCourse.courseImgUrl || !tempNewCourse.coursePrice || !tempNewCourse.institution || !tempNewCourse.description) {
      alert("Please fill in all required fields.");
      return;
    }

    if (courses.some(c => c.courseCode === tempNewCourse.courseCode)) {
      alert("Course code already exists.");
      return;
    }

    try {
      await createCourse(tempNewCourse);

      const updatedCourses = [...courses];
      updatedCourses.push(tempNewCourse)
      setCourses(updatedCourses);

      handleCloseNewCourse()
      // disabledEdit();
      // setTempCourse(null);
    } catch (error) {
      alert("Error updating course:", error);
      console.error("Error updating course:", error);
    }

  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const token = getToken();

  return (
    <>
      <div className="container-sm">
        <div className="row">
          <div className="col-1">
            <div className="list-group" id="list-tab" role="tablist">
              <a className={`list-group-item list-group-item-action ${activeTab
                === 'user' ? 'active' : ''}`} id="user-list" data-bs-toggle="list" href="#user" role="tab" aria-controls="user" onClick={() => handleTabClick('user')}>Users</a>
              <a className={`list-group-item list-group-item-action ${activeTab === 'courses' ? 'active' : ''}`} id="courses-list" data-bs-toggle="list" href="#courses" role="tab" aria-controls="courses" onClick={() => handleTabClick('courses')}>Courses</a>
              {/* <a className={`list-group-item list-group-item-action ${activeTab === 'list-messages' ? 'active' : ''}`} id="list-messages-list" data-bs-toggle="list" href="#list-messages" role="tab" aria-controls="list-messages" onClick={() => handleTabClick('list-messages')}>Messages</a> */}
              {/* <a className={`list-group-item list-group-item-action ${activeTab === 'list-settings' ? 'active' : ''}`} id="list-settings-list" data-bs-toggle="list" href="#list-settings" role="tab" aria-controls="list-settings" onClick={() => handleTabClick('list-settings')}>Settings</a> */}
            </div>
          </div>
          <div className="col-11">
            <div className="tab-content" id="nav-tabContent">
              <div className={`tab-pane fade  
                ${activeTab === 'user' ? 'show active' : ''}`} id="user" role="tabpanel" aria-labelledby="user-list">

                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      {/* <th scope="col">#</th> */}
                      <th scope="col" class="align-middle">First Name</th>
                      <th scope="col" class="align-middle">Last Name</th>
                      <th scope="col" class="align-middle">Username</th>
                      <th scope="col" class="align-middle">Email</th>
                      <th scope="col" class="align-middle">User Type</th>
                      <th scope="col" class="align-middle">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((user) =>
                      <>
                        <tr>
                          {/* <th>{user._id}</th> */}
                          <td class="align-middle">{user.firstName}</td>
                          <td class="align-middle">{user.lastName}</td>
                          <td class="align-middle">{user.userName}</td>
                          <td class="align-middle">{user.email}</td>
                          <td class="align-middle">{user.userType}</td>
                          <td>
                            {user && user.pendingCourse && user.pendingCourse.length <= 0 ? (
                              <button onClick={() => handleShowPending(user)} type="button" class="btn btn-light btn-sm" disabled>No Pending</button>
                            ) : (
                              <button onClick={() => handleShowPending(user)} type="button" class="btn btn-info btn-sm">Pending</button>
                            )}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className={`tab-pane fade ${activeTab === 'courses' ? 'show active' : ''}`} id="courses" role="tabpanel" aria-labelledby="courses-list">
                {/* courses */}
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      {/* <th scope="col">#</th> */}
                      <th scope="col" class="align-middle">Course Code</th>
                      <th scope="col" class="align-middle">Course Name</th>
                      <th scope="col" class="align-middle">Institution</th>
                      <th scope="col" class="align-middle">Program</th>
                      <th scope="col" class="align-middle">Course Price</th>
                      <th scope="col" class="align-middle">Published</th>
                      <th scope="col" class="align-middle">
                        <button onClick={() => handleNewCourse()} type="button" class="btn btn-light btn-sm align-middle shadow-sm" disabled={itemID !== null}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                          </svg>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((course) =>
                      <>
                        <tr>
                          {/* <th>{course._id}</th> */}
                          {itemID == course._id && tempCourse ?
                            (<>
                              <td><input className="form-control" type="text" defaultValue={tempCourse.courseCode} onChange={(e) => handleInputChange(e, 'courseCode')} style={{ maxWidth: '100px' }} /></td>
                              <td><input className="form-control" type="text" defaultValue={tempCourse.courseName} onChange={(e) => handleInputChange(e, 'courseName')} /></td>
                              {/* <td><input className="form-control" type="text" defaultValue={tempCourse.institution} onChange={(e) => handleInputChange(e, 'institution')} /></td> */}
                              <td>
                                <select id="institution" className="form-select" value={tempNewCourse.institution} onChange={(e) => handleInputChange(e, 'institution')}>
                                  {InstitutionList.map((institution, index) => (
                                    <option key={index} value={institution} selected={tempNewCourse.institution === institution}>{institution}</option>
                                  ))}
                                </select>
                              </td>
                              <td><input className="form-control" type="text" defaultValue={tempCourse.program} onChange={(e) => handleInputChange(e, 'program')} /></td>
                              <td><input className="form-control" type="number" defaultValue={tempCourse.coursePrice} onChange={(e) => handleInputChange(e, 'coursePrice')} style={{ maxWidth: '100px' }} /></td>
                              <td className="align-middle">
                                <div class="form-check form-switch" style={{ maxWidth: '100px' }}>
                                  <input class="form-check-input" type="checkbox" role="switch" checked={tempCourse.published} onChange={(e) => handleInputChange(e, 'published', tempCourse)}></input>
                                </div>
                              </td>
                              <td>
                                <span className="mx-1">
                                  <button onClick={() => handleSaveEdit(course._id)} type="button" class="btn btn-info btn-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy" viewBox="0 0 16 16">
                                      <path d="M11 2H9v3h2z" />
                                      <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
                                    </svg>
                                  </button>
                                </span>
                                <span className="mx-1">
                                  <button onClick={() => handleCancelEdit(course._id)} type="button" class="btn btn-light btn-sm" aria-label="Close">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
                                      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                    </svg>
                                  </button>
                                </span>
                              </td>
                            </>)
                            :
                            (<>
                              <td class="align-middle">{course.courseCode}</td>
                              <td class="align-middle">{course.courseName}</td>
                              <td class="align-middle">{course.institution}</td>
                              <td class="align-middle">{course.program}</td>
                              <td class="align-middle">{course.coursePrice}/hr</td>
                              <td class="align-middle">{course.published ? "Yes" : "No"}</td>
                              <td>
                                <button onClick={() => handleEnableEdit(course)} type="button" class="btn btn-light btn-sm align-middle shadow-sm" disabled={itemID !== course._id && itemID !== null || showAddModel}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                                  </svg>
                                </button>
                                <button onClick={() => handleShowAssignedModel(course)} type="button" class="btn btn-light btn-sm align-middle mx-2 shadow-sm" disabled={itemID !== null || showAddModel}>Tutors</button>
                                {/* {!isShowDelete ?
                                  (<>
                                    <button onClick={() => handleEnableEdit(course._id)} type="button" class="btn btn-light btn-sm align-middle shadow-sm" disabled={itemID !== course._id && itemID !== null}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                                      </svg></button>
                                    <button onClick={() => handleShowAssignedModel(course)} type="button" class="btn btn-light btn-sm align-middle mx-2 shadow-sm">Tutors</button>
                                    <button onClick={() => handleShowDelete()} type="button" class="btn btn-danger btn-sm align-middle shadow-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                      </svg>
                                    </button>
                                  </>)
                                  :
                                  (<>
                                    <button onClick={() => handleDeleteCourse(course)} type="button" class="btn btn-danger btn-sm align-middle mx-2 shadow-sm">Delete</button>
                                    <button onClick={() => handleHideDelete()} type="button" class="btn btn-secondary btn-sm align-middle mx-2 shadow-sm">Cancel</button>
                                  </>)
                                } */}
                              </td>
                            </>)
                          }

                        </tr >
                      </>
                    )}
                  </tbody >
                </table>
              </div>
              {/* <div className={`tab-pane fade ${activeTab === 'list-messages' ? 'show active' : ''}`} id="list-messages" role="tabpanel" aria-labelledby="list-messages-list">3</div> */}
              {/* <div className={`tab-pane fade ${activeTab === 'list-settings' ? 'show active' : ''}`} id="list-settings" role="tabpanel" aria-labelledby="list-settings-list">4</div> */}
            </div>
          </div>
        </div>
      </div >
      <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a className="page-link" href="#" onClick={() => handlePageChange(currentPage - 1)}>Previous</a>
          </li>
          {pageNumbers.map((pageNumber) => {
            if (pageNumber === '...') {
              return <li className="page-item disabled"><a className="page-link">...</a></li>;
            }
            return (
              <li className={`page-item ${currentPage === pageNumber ? 'active' : ''}`} key={pageNumber}>
                <a className="page-link" href="#" onClick={() => handlePageChange(pageNumber)}>{pageNumber}</a>
              </li>
            );
          })}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a className="page-link" href="#" onClick={() => handlePageChange(currentPage + 1)}>Next</a>
          </li>
        </ul>
      </nav>

      {/* <!-- Modal --> showAssignedModel */}
      {/* <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"> */}
      {/* <div class="modal fade" aria-labelledby="exampleModalLabel" aria-hidden="false" style={{ display: showAssignedModel ? 'contents' : 'none', zIndex: 5 }}> */}
        <div
          className={`modal fade ${showAssignedModel ? "show" : ""}`} 
          style={{ display: showAssignedModel ? "block" : "none" }}
          tabIndex="-1"
        >
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" rounded style={{ zIndex: 5 }}>
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                {assignedCourse ? (<>{assignedCourse.courseCode}</>) : (<>N/A</>)}
              </h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => handleCloseAssignedModel()}></button>
            </div>
            <div class="modal-body">
              <input type="text" class="form-control" placeholder="Tutor Name" value={tutorName} onChange={(e) => setTutorName(e.target.value)}></input>
              <ul class="list-group my-2" style={{ maxHeight: "250px", overflowY: 'scroll' }}>
                {/* tutors */}
                {tutors && assignedCourse && tutors.filter((tutor) => tutor.userName.toLowerCase().includes(tutorName.toLowerCase())).length > 0 ? (
                  tutors
                    .filter((tutor) => tutor.userName.toLowerCase().includes(tutorName.toLowerCase()))
                    .map((tutor) => (
                      <li class="list-group-item d-flex justify-content-between align-items-center" key={tutor._id}>
                        <div>{tutor.userName}</div>
                        {assignedCourse.assignedTutors.includes(tutor._id) ? (
                          <button onClick={() => handleRemoveAssignedTutor(tutor)} type="button" class="btn btn-danger btn-sm align-middle">Remove</button>
                        ) : (
                          <button onClick={() => handleAddAssignedTutor(tutor)} type="button" class="btn btn-primary btn-sm align-middle">Assign</button>
                        
                        )}
                      </li>
                    ))
                ) : (
                  <li class="list-group-item">No tutors available.</li>
                )}
              </ul>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary mx-auto" data-bs-dismiss="modal" onClick={() => handleCloseAssignedModel()}>Close</button>
              {/* <button type="button" class="btn btn-primary">Save changes</button> */}
            </div>
          </div>
        </div>
      </div>
      {/* <!-- Modal --> showPending */}
      {/* <div class="modal fade" aria-labelledby="exampleModalLabel" aria-hidden="false" style={{ display: showPendingModel ? 'contents' : 'none', zIndex: 5 }}> */}
      <div
          className={`modal fade ${showPendingModel ? 'show' : ''}`}
          aria-labelledby="exampleModalLabel"
          aria-hidden={!showPendingModel}
          style={{
            display: showPendingModel ? 'block' : 'none',
            zIndex: 1050
          }}
        >
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable rounded" style={{ zIndex: 5 }}>
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Pending course
              </h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => handleClosePending()}></button>
            </div>
            <div class="modal-body">
              <ul class="list-group my-2" style={{ maxHeight: "250px", overflowY: 'scroll' }}>
                {/* tutors */}
                {tempTutor && tempTutor.pendingCourse ? (
                  tempTutor.pendingCourse
                    .map((course) => (
                      <li class="list-group-item d-flex justify-content-between align-items-center" key={course._id}>
                        <div>{course.courseCode}</div>
                        <button onClick={() => handleApprovedPendingCourse(course)} type="button" class="btn btn-primary btn-sm align-middle">Approved</button>
                        {/* {assignedCourse.assignedTutors.includes(tutor._id) ? (
                          <button onClick={() => handleRemoveAssignedTutor(tutor)} type="button" class="btn btn-danger btn-sm align-middle">Remove</button>
                        ) : (
                          <button onClick={() => handleAddAssignedTutor(tutor)} type="button" class="btn btn-primary btn-sm align-middle">Assign</button>
                        )} */}
                      </li>
                    ))
                ) : (
                  <li class="list-group-item">No Pending Courses.</li>
                )}
              </ul>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary mx-auto" data-bs-dismiss="modal" onClick={() => handleClosePending()}>Close</button>
              {/* <button type="button" class="btn btn-primary">Save changes</button> */}
            </div>
          </div>
        </div>
      </div>
      {/* add new course */}
      <div class="modal fade position-absolute top-50 start-50 translate-middle" aria-hidden="false" style={{ display: showAddModel ? 'contents' : 'none', zIndex: 5 }}>
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable shadow-lg rounded position-absolute top-50 start-50 translate-middle" style={{ zIndex: 5, minWidth: "100%", maxHeight: "80%"}}>
          <div class="modal-content"style={{ height: "100%"}} >
            <div class="modal-header">
              <h5 class="modal-title">Add New Course</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => handleCloseNewCourse()}></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="courseCode" class="form-label">Course Code</label>
                <input type="text" class="form-control" id="courseCode" placeholder="Enter course code" value={tempNewCourse.courseCode} onChange={(e) => handleInputChangeCourse(e, 'courseCode')} />
              </div>
              <div class="mb-3">
                <label for="courseName" class="form-label">Course Name</label>
                <input type="text" class="form-control" id="courseName"
                  placeholder="Enter course name" value={tempNewCourse.courseName} onChange={(e) => handleInputChangeCourse(e, 'courseName')} />
              </div>
              <div class="mb-3">
                <label for="program" class="form-label">Program</label>
                <input type="text" class="form-control" id="program"
                  placeholder="Enter program name" value={tempNewCourse.program} onChange={(e) => handleInputChangeCourse(e, 'program')} />
              </div>
              <div class="mb-3">
                <label for="courseImgUrl" class="form-label">Course Image URL</label>
                <input type="text" class="form-control" id="courseImgUrl" placeholder="Enter course image URL" value={tempNewCourse.courseImgUrl} onChange={(e) => handleInputChangeCourse(e, 'courseImgUrl')} />
              </div>
              <div class="mb-3">
                <label for="coursePrice" class="form-label">Course Price</label>
                <input type="number" class="form-control" id="coursePrice"
                  placeholder="Enter course price" value={tempNewCourse.coursePrice} onChange={(e) => handleInputChangeCourse(e, 'coursePrice')} />
              </div>
              {/* <div class="mb-3">
                <label for="institution" class="form-label">Institution</label>
                <input type="text" class="form-control" id="institution" placeholder="Enter institution name"
                  value={tempNewCourse.institution} onChange={(e) => handleInputChangeCourse(e, 'institution')} />
              </div> */}
              <div class="mb-3">
                <label htmlFor="institution" className="form-label">Institution</label>
                <select id="institution" className="form-select" value={tempNewCourse.institution} onChange={(e) => handleInputChangeCourse(e, 'institution')}>
                  {InstitutionList.map((institution, index) => (
                    <option key={index} value={institution}>{institution}</option>
                  ))}
                </select>
              </div>
              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea class="form-control" id="description" rows="3"
                  placeholder="Enter course description" value={tempNewCourse.description} onChange={(e) => handleInputChangeCourse(e, 'description')} />
              </div>
              {/* <button type="submit" class="btn btn-primary">Create Course</button> */}
            </div>
            <div class="modal-footer list-group-item d-flex justify-content-around align-items-center">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onClick={() => handleCloseNewCourse()}>Close</button>
              <button type="button" class="btn btn-primary" onClick={() => handleAddNewCourse()}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
