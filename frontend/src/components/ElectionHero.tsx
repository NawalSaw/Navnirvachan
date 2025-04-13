"use client";

import React from "react";

function ElectionHero() {
  const numClouds = 6; // Number of clouds
  const radius = 29; // Radius of the circle
  const features = [
    "Digitalized System",
    "Ease of Home",
    "Powered by AI",
    "Multilingual",
    "Vote from anywhere",
    "Secure",
  ];

  return (
    <div className="relative h-[600px] w-full text-white flex justify-center items-center">
      {/* Clouds container */}
      <div className="absolute mt-20 rounded-full flex items-center justify-center rotate">
        {Array.from({ length: numClouds }).map((_, i) => {
          const angle = (i / numClouds) * 360; // Angle in degrees
          const radianAngle = (angle * Math.PI) / 180; // Convert to radians
          const x = Math.cos(radianAngle) * radius * 8;
          const y = Math.sin(radianAngle) * radius * 8;
          return (
            <div
              key={i}
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${angle}deg)`, // Move + Rotate
              }}
              className="absolute w-44 h-44 rounded-full group flex justify-center items-center"
            >
              <div
                style={{ transform: `rotate(-${angle}deg)` }} // 🔥 Counter-rotate text
                className="bg-indigo-800 opacity-50 rounded-full z-[20] w-44 h-44 transition-all duration-150 hover:scale-110 flex justify-center items-center"
              >
                <p className="text-center font-bold text-xl rotate-reverse text-wrap max-w-40">
                  {features[i]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center text */}
      <div className="z-30 mt-9 flex-col gap-2 text-4xl font-bold text-center text-black">
        <p>Register Now!</p>
        <div className="relative sm:inline-flex group hidden mt-2">
          <div className="absolute top-6 mt-4 transition-all duration-1000 opacity-20 -inset-px bg-amber-400 rounded-full blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
          <a
            href="/register"
            title="Get quote now"
            className="relative inline-flex items-center justify-center px-4 lg:px-6 py-2 text-md sm:text-lg font-bold text-white transition-all duration-200 bg-amber-500 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 mt-5"
            role="button"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}

export default ElectionHero;
