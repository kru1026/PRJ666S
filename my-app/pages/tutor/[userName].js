// my-app/pages/tutor/[userName].js

import { useRouter } from 'next/router';
import TutorAvailability from '../../components/TutorAvailability'; 

const TutorPage = () => {
  const router = useRouter();
  const { userName } = router.query; 

  return (
    <div>
      {userName ? (
        <TutorAvailability userName={userName} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TutorPage;
