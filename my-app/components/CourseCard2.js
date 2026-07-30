// my-app/components/CourseCard.js

import Link from 'next/link';
import { Card } from 'react-bootstrap';
import { readToken } from '@/lib/authenticate';
import { useState, useEffect } from 'react';

function CourseCard2({ course }) {

  let token = readToken();

  const { courseCode, courseName, courseImgUrl, coursePrice } = course;

  const defaultImageUrl = "/placeholder.png";  // Ensure you provide a valid path for the default image
  const imageUrl = courseImgUrl || defaultImageUrl;

  return (
    <>
      <Link href={`/course-details/${courseCode}`} legacyBehavior passHref>
        <a className="shadow rounded-2" style={{ display: 'inline-block', overflow: "hidden", textDecoration: 'none', width: '230px' }}>
          <Card className="border-0 text-black">
            <Card.Body className="pa-0 d-flex flex-column justify-content-between" style={{ height: "230px" }}>
              <Card.Img variant="top" src={imageUrl} style={{ objectFit: 'cover', height: "100px" }} />
              <h6 className="px-2">{course?.courseCode || "N/A"}</h6>
              <Card.Text>
                <div className="container">
                  <div className="row">
                    <div className="col text-start">
                      {course.institution}
                    </div>
                    <div className="col text-end">
                      {"$" + (course?.coursePrice || "N/A") + "/hr"}
                    </div>
                  </div>
                </div>
              </Card.Text>
            </Card.Body>
          </Card>
        </a>
      </Link>
    </>
  );
}

export default CourseCard2;
