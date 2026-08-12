// my-app/components/Footer.js

import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { removeToken, readToken } from '@/lib/authenticate';

function Footer() {
  const router = useRouter();
  let token = readToken();

  return (<>
    <div class="pt-10 container-fluid bg-light-subtle border-bottom">
      <div class="py-3 text-center">
        <div class="card-body">
          {/* <h6 class="card-title fw-bold">
          <a className={`nav-link ${router.pathname === '/' ? 'active' : ''}`} aria-current="page" href="/">Find Me a Tutor (Home)</a>
          </h6> */}
          <div class="container text-centerm mt-3">
            <div class="row">
              <div class="col">
                <Link className={`nav-link ${router.pathname === '/tutorsList' ? 'active' : ''}`} aria-current="page" href="/tutorsList">Tutors</Link>
              </div>
              <div class="col">
                <Link className={`nav-link ${router.pathname === '/' ? 'active' : ''}`} aria-current="page" href="/">Home</Link>
              </div>
              <div class="col">
                <Link className={`nav-link ${router.pathname === '/allCoursesList' ? 'active' : ''}`} href="/allCoursesList">Courses</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-fluid bg-light-subtle">
      <p class="text-center pt-2">@ 2024 FMAT Inc | Privacy | Terms</p>
    </div>
  </>);
}

export default Footer;