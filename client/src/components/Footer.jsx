import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-[#E2E7DF] bg-white text-[#526056]">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-3">
          <Link to="/" className="text-lg font-extrabold tracking-tight text-[#17231A]">
            PhytoGuard
          </Link>
          <p className="text-sm leading-relaxed max-w-md">
            Full-stack crop leaf disease classification and integrated pest management reference
            platform powered by MongoDB, Express, React, Node.js, FastAPI, and TensorFlow CNNs.
          </p>
          <p className="text-xs text-[#68766C] leading-relaxed max-w-lg">
            Educational Advisory Notice: Predictions and management notes are intended for
            agricultural education and field scouting support. Always verify critical crop
            diagnoses with a certified regional agronomy extension specialist.
          </p>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-[#17231A]">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/upload" className="hover:text-[#17231A] transition-colors">
                Leaf Diagnosis Upload
              </Link>
            </li>
            <li>
              <Link to="/diseases" className="hover:text-[#17231A] transition-colors">
                PlantVillage Disease Library
              </Link>
            </li>
            <li>
              <Link to="/history" className="hover:text-[#17231A] transition-colors">
                Prediction History
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#17231A] transition-colors">
                System Architecture
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-[#17231A]">Account</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/dashboard" className="hover:text-[#17231A] transition-colors">
                Grower Dashboard
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-[#17231A] transition-colors">
                Account & Security
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-[#17231A] transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-[#17231A] transition-colors">
                Create Account
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E2E7DF] py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#68766C]">
          <span>© {new Date().getFullYear()} PhytoGuard Crop Pathology Project. All rights reserved.</span>
          <span>MERN Stack · FastAPI · Convolutional Neural Network</span>
        </div>
      </div>
    </footer>
  );
}
