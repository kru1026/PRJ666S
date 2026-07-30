import Link from 'next/link';
import { Card } from 'react-bootstrap';
import { readToken } from '@/lib/authenticate';

function TutorCard({ tutor }) {
  let token = readToken();

  const { _id, userName, firstName, lastName, jobTitle, baseLocation, selfDescription, email, feedback } = tutor;

  // Calculate average rating from feedback array
  const calculateAverageRating = (feedback) => {
    if (!feedback || feedback.length === 0) return 0;
    const totalRating = feedback.reduce((acc, curr) => acc + curr.rating, 0);
    return (totalRating / feedback.length).toFixed(1); // Rounded to 1 decimal place
  };

  // Render stars based on average rating
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

  return (
    <>
      <Link href={`/profile/${_id}`} legacyBehavior passHref>
        <a className="shadow rounded-2" style={{ display: 'inline-block', overflow: "hidden", textDecoration: 'none', width: '230px' }}>
          <Card className="border-0 text-black">
            <Card.Body className="pa-0 d-flex flex-column" style={{ height: "210px" }}>
              {/* <Card.Img variant="top" src={imageUrl} style={{ objectFit: 'cover', maxHeight: "130px" }} /> */}
              <h6 className="px-2">{userName || "N/A"}</h6>
              <Card.Text>
                <div className="container">
                  <div className="row">
                    <div className="col text-start">
                      {firstName} {lastName} <br />
                      {jobTitle} <br />
                      <div>{renderStars(calculateAverageRating(feedback))}</div> {/* Calculate and render stars */}
                      {baseLocation} <br/>
                      {email} <br/>
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

export default TutorCard;
