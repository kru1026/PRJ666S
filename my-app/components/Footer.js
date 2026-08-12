// my-app/components/Footer.js

import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { removeToken, readToken } from '@/lib/authenticate';
import { FaHome, FaUser, FaClipboard } from 'react-icons/fa';

function Footer() {
  const router = useRouter();
  let token = readToken();

  return (
  <>
    <div
      className="container-fluid border-bottom"
      style={{ backgroundColor: 'black' }}
    >
      <div className="py-3 text-center">
        <div className="card-body">
          <div className="container text-center mt-3">
            <div className="row">
              
              <div className="col">
                <Link
                  className={`footer-link ${
                    router.pathname === '/tutorsList' ? 'active' : ''
                  }`}
                  href="/tutorsList"
                >
                <FaUser /> Tutors
                </Link>
              </div>

              <div className="col">
                <Link
                  className={`footer-link ${
                    router.pathname === '/' ? 'active' : ''
                  }`}
                  href="/"
                >
                <FaHome /> Home
                </Link>
              </div>

              <div className="col">
                <Link
                  className={`footer-link ${
                    router.pathname === '/allCoursesList' ? 'active' : ''
                  }`}
                  href="/allCoursesList"
                >
                <FaClipboard /> Courses
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-center pt-2 text-white">
          @ 2024 FMAT Inc | Privacy | Terms
        </p>
      </div>
    </div>
  </>
);
}

export default Footer;