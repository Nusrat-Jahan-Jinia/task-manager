import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { CiFacebook } from 'react-icons/ci';
import { FaInstagram } from 'react-icons/fa';
import { FaLinkedin } from 'react-icons/fa';
import { FaSquareGithub } from 'react-icons/fa6';
import { FaStackOverflow } from 'react-icons/fa6';

function Footer() {
  return (
    <div className="hidden md:flex md:w-full  md:fixed md:bottom-0 bg-gray-800">
      <div className="container mx-auto p-4 items-center flex">
        <div class="flex md:flex-column basis-1/2 gap-4 ">
          <a href="https://www.facebook.com/JahanJinia" target="_blank" class="flex gap-2 text-white items-center">
            <span className="i">Facebook</span>
            <CiFacebook />
          </a>
          <a
            href="https://www.linkedin.com/in/nusrat-jahan-98748a5a/"
            target="_blank"
            className="flex gap-2 text-white items-center"
          >
            <span class="i">Linkedln</span>
            <FaLinkedin />
          </a>
          <a
            href="https://stackoverflow.com/users/7108468/nusratjinia?tab=profile"
            target="_blank"
            className="flex gap-2 text-white items-center"
          >
            <span class="i">StackOverflow</span>
            <FaStackOverflow />
          </a>
          <a
            href="https://github.com/Nusrat-Jahan-Jinia"
            target="_blank"
            className="flex gap-2 text-white items-center"
          >
            <span class="i">GitHub</span>
            <FaSquareGithub />
          </a>
        </div>
        <div className="basis-1/2 justify-items-end">
          <p className="text-white">© 2024 Your Company, Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Footer;
