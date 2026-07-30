// my-app/pages/my-courses.js

import { useState, useEffect } from 'react';
// import { getAllCourses } from '@/lib/authenticate';

export default function MyCourses() {
    const [error, setError] = useState(null);
    
    useEffect(() => {
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>My courses</h1>
        </div>
    );
};
