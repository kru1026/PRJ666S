// my-app/pages/index.js

import { useState, useEffect } from 'react';
import { getAllCourses, getAllTutors, getToken } from '@/lib/authenticate';
import { Card } from 'react-bootstrap';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import CourseCard2 from '@/components/CourseCard2';
import TutorCard from '@/components/TutorCard';
import { getMostPurchasedCourses } from './api/getMostPurchasedCourses';
import PopularCourseCard from '@/components/PopularCourseCard';
import { getMostRatedCourses } from './api/getMostRatedCourses';
import MostRatedCourseCard from '@/components/MostRatedCourseCard';

export default function Home() {

    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);

    const [error, setError] = useState(null);

    const [tutors, setTutors] = useState([]);
    const [mostPurchasedCourses, setMostPurchasedCourses] = useState([]);

    const [mostRatedCourses, setMostRatedCourses] = useState([]);
    const [purchaseCount, setPurchasedCount] = useState([]);

    const [storedUser, setStoredUser] = useState(null);
    const [token, setToken] = useState(null);

    const [recommendationMessage, setRecommendationMessage] = useState("");

    // const storedUser = JSON.parse(localStorage.getItem('user'));
    // const token = getToken();

    useEffect(() => {
    setToken(getToken());
}, []);

    useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
        setStoredUser(JSON.parse(user));
    }
}, []);

    useEffect(() => {
    const fetchCourses = async () => {
        try {
            console.log("Fetching courses...");
            const data = await getAllCourses();
            console.log("Courses OK");
            setCourses(data);
        } catch (err) {
            console.log("Courses FAILED:", err);
            setError(err.message);
        }
    };

    fetchCourses();
}, []);

    useEffect(() => {
        const fetchTutors = async () => {
          try {
            console.log("Fetching tutors...");
            const data = await getAllTutors();
            console.log("tutors OK");
            // Calculate average ratings and sort tutors by rating in descending order
            const sortedTutors = data
              .map((tutor) => ({
                ...tutor,
                averageRating: calculateAverageRating(tutor.feedback),
              }))
              .sort((a, b) => b.averageRating - a.averageRating) // Sort by highest rating
              .slice(0, 5); // Select the top 5 tutors
    
            setTutors(sortedTutors);
          } catch (err) {
            console.log("fetching tutors failed", err);
            setError(err.message);
          }
        };
    
        fetchTutors();
      }, []);

      useEffect(() => {
        const fetchMostPurchasedCourses = async () => {
            try {
                console.log("Fetching mostPurchased...");
                const data = await getMostPurchasedCourses();
                console.log("Fetching mostPurchased ok...");
                setMostPurchasedCourses(data);
            } catch (err) {
                console.log("Fetching mostPurchased failed");
                setError(err.message);
            }
        };

        fetchMostPurchasedCourses();
    }, []);

    useEffect(() => {
        const fetchMostRatedCourses = async () => {
            try {
                console.log("Fetching mostRated...");
                const data = await getMostRatedCourses();
                console.log("Fetching mostRated...ok ");
                setMostRatedCourses(data);
            } catch (err) {
                console.log("Fetching mostRated failed...", err);
                setError(err.message);
            }
        };

        fetchMostRatedCourses();
    }, []);

    useEffect(() => {
        // Filter courses by institution
        const institutionCourses = courses.filter(course => course.institution === storedUser.institution);
    
        if (institutionCourses.length === 0) {
          // No institution match, so display all courses (up to 5)
          setFilteredCourses(courses.slice(0, 5));
        } else {
          // Filter by program within institution-matched courses
          const matchingProgramCourses = institutionCourses.filter(course => course.program === storedUser.program);
    
          // Prioritize program matches, then fill with institution matches up to 5 courses
          const selectedCourses = [
            ...matchingProgramCourses,
            ...institutionCourses.filter(course => !matchingProgramCourses.includes(course))
          ].slice(0, 5);
    
          setFilteredCourses(selectedCourses);
        }
      }, [courses]);

//     useEffect(() => {
//     if (!storedUser) {
//         setRecommendationMessage("Please log in to see course recommendations.");
//         return;
//     }

//     const institutionCourses = courses.filter(
//         course => course.institution === storedUser.institution
//     );

//     if (institutionCourses.length === 0) {
//         setFilteredCourses(courses.slice(0, 5));
//     } else {
//         const matchingProgramCourses = institutionCourses.filter(
//             course => course.program === storedUser.program
//         );

//         const selectedCourses = [
//             ...matchingProgramCourses,
//             ...institutionCourses.filter(
//                 course => !matchingProgramCourses.includes(course)
//             )
//         ].slice(0, 5);

//         setFilteredCourses(selectedCourses);
//     }

// }, [courses, storedUser]);


//     if (error) {
//         return <div>Error: {error}</div>;
//     }

    const calculateAverageRating = (feedback) => {
        if (!feedback || feedback.length === 0) return 0;
        const totalRating = feedback.reduce((acc, curr) => acc + curr.rating, 0);
        return (totalRating / feedback.length).toFixed(1); // Rounded to 1 decimal place
      };

    return (
        <>
            <div class="container-sm">
                {token && storedUser && (<h1>Welcome: {storedUser.userName}</h1>)} <br />

                {recommendationMessage ? (
                    <h5>{recommendationMessage}</h5>
                ) : (
                    <>
                    <h5>Recommended for you</h5>

                    {filteredCourses.slice(0, 5).map((course) => (
                <span className="mx-2" key={course._id}>
                    <CourseCard2 course={course} />
                </span>
                 ))}
                </>
                )}

                {filteredCourses && (
                    <h5>Recommended for you</h5>
                )}

                {filteredCourses.slice(0, 5).map((course) =>
                    <>
                        <span class="mx-2">
                            <CourseCard2 key={course._id} course={course}></CourseCard2>
                        </span>
                    </>
                )}
            </div><br />

            <div class="container-sm">
            {tutors && (
                    <h5>Featured Tutors</h5>
                )}

                {tutors.slice(0, 5).map((tutor) =>
                    <>
                        <span class="mx-2">
                            <TutorCard key={tutor._id} tutor={tutor}></TutorCard>
                        </span>
                    </>
                )}
            </div><br />

            <div class="container-sm">
            {mostPurchasedCourses && (
                    <h5>Popular Courses</h5>
                )}

                {mostPurchasedCourses.slice(0, 5).map((course) =>
                    <>
                        <span class="mx-2">
                            <PopularCourseCard key={course._id} course={course}></PopularCourseCard>
                        </span>
                    </>
                )}
            </div><br />

            <div class="container-sm">
            {mostRatedCourses && (
                    <h5>Most Rated Courses</h5>
                )}

                {mostRatedCourses.slice(0, 5).map((course) =>
                    <>
                        <span class="mx-2">
                            <MostRatedCourseCard key={course._id} course={course}></MostRatedCourseCard>
                        </span>
                    </>
                )}
            </div>
        </>
    );
};
