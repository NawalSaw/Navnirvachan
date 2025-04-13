"use client";

import ElectionHero from "@/components/ElectionHero";

export default function Home() {
  return (
    <div className="overflow-hidden h-[100vh]">
      <div
        style={{
          backgroundImage: "url(/Mist.png)", // Replace with the path to your image /tricolourMist.png",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          opacity: "",
          width: "100%",
          height: "100vh",
        }}
        className="absolute p-5 z-[-1]"
      ></div>
      <div className="flex justify-center items-center mt-32 z-10 mb-5">
        <h1 className="text-5xl max-w-4xl font-bold text-center z-[100] text-white">
          Introducing the new way of Voting for Digital India
        </h1>
      </div>
      <ElectionHero />
    </div>
  );
}
