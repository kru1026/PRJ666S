// my-app/components/CourseCardList.js

import Link from 'next/link';
import { Card } from 'react-bootstrap';
import { readToken } from '@/lib/authenticate';
import { useRouter } from 'next/router';

function CourseCardList({ course }) {
  let token = readToken();
  const router = useRouter();

  const { courseCode, courseName, courseImgUrl, coursePrice } = course;

  const defaultImageUrl = "/placeholder.png";  // Ensure you provide a valid path for the default image
  const imageUrl = courseImgUrl || defaultImageUrl;

  const handleNavToCourse = () => {
    router.push(`/course-details/${course.courseCode}`);
  };

  return (
    <>
      <div class="card rounded-2 w-100 my-1 px-2 py-1 shadow-sm" style={{ border: 'none' }}>
        <div class="row">
          <div class="col">
            <h5 class="card-title">{course?.institution || "N/A"} - {course?.courseCode || "N/A"}</h5>
            {/* <div>date xxxx, rating: A</div> */}
          </div>
          <div className="col text-end">
            {"$" + (course?.coursePrice || "N/A") + "/hr"}
          </div>
        </div>
        <div class="row g-0">
          <div class="col-md-4">
            <img src={imageUrl} style={{ objectFit: 'cover', width: '100%' }} class="img-fluid rounded" alt="..."></img>
          </div>
          <div class="col-md-8">
            <div class="card-body">
              {/* <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p> */}
              <p class="card-text">{course?.description}</p>
              {/* <p class="card-text"><small class="text-body-secondary">xxxxx</small></p> */}
              <button onClick={() => handleNavToCourse()} type="button" class="btn btn-light btn-sm align-middle shadow-sm">Detail</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseCardList;
