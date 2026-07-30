// my-app/components/RouteGuard.js

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/lib/authenticate';
import { useAtom } from 'jotai';


const PUBLIC_PATHS = ['/login', '/_error', '/register', '/reset-password', '/'];

export default function RouteGuard(props) { 

  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    
    authCheck(router.pathname);

    
    router.events.on('routeChangeComplete', authCheck);

    
    return () => {
      router.events.off('routeChangeComplete', authCheck);
    };
  }, []);

  let alertShown = false;

  function authCheck(url) {
    
    const path = url.split('?')[0];
    
    if ((!isAuthenticated() && !PUBLIC_PATHS.includes(path)) && (!path.startsWith('/course-details')) && (!path.startsWith('/profile'))) {
      setAuthorized(false);
      if (!alertShown) {
        alert("Please login to visit this page");
        alertShown = true;
      }
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }

  return <>{authorized && props.children}</>
}