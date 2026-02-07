import React from "react";
import { Github, Linkedin, Facebook, X } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-black to-neutral-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div>
            <h1 className="text-2xl font-semibold text-white mb-4">
              Cosmic Watch
            </h1>

            <p className="text-sm text-gray-400 max-w-md mb-6">
              Asteroid Observer
            </p>

            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 rounded-md bg-neutral-900 hover:bg-neutral-800 transition"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-md bg-neutral-900 hover:bg-neutral-800 transition"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-md bg-neutral-900 hover:bg-neutral-800 transition"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-md bg-neutral-900 hover:bg-neutral-800 transition"
              >
                <X size={18} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">TOOLS</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Plans</a></li>
                <li><a href="#" className="hover:text-white">Safety</a></li>
                <li><a href="#" className="hover:text-white">Partners</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">DOCS</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Guide</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Updates</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">LEGAL</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">DPA</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
                <li><a href="#" className="hover:text-white">Trust</a></li>
                <li><a href="#" className="hover:text-white">Prefs</a></li>
              </ul>
            </div>

          </div>
        </div>


        <div className="border-t border-neutral-800 mt-12 pt-6 text-center text-sm text-gray-500">
          © 2026 Cosmic Watch. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
