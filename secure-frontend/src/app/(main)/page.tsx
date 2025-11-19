"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-no-repeat bg-blur-md bg-center bg-cover md:bg-cover sm:bg-contain opacity-40 z-[-1]"
        style={{ backgroundImage: "url('/images-removebg-preview.png')" }}
      />
      {/* Hero Text */}
      <div className="flex flex-col text-center text-white gap-6 justify-center items-center h-full px-4">
          <h1 className="text-3xl md:text-7xl font-bold max-w-3xl">
            Digitalized Election
          </h1>
          <p className="max-w-lg">
            Introducing the digital voting system for the new changing world
            Digitalized System | Ease of Home | Multilingual | Powered by AI |
            Vote from anywhere | Decentralized system
          </p>
          <Link href="/register" >
          <Button className="bg-amber-700 hover:bg-amber-600">
            Register Now!
            </Button>
            </Link>
      </div>
    </div>
  );
}
