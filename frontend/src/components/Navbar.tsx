import React from "react";
import localFont from "next/font/local";
import { ChevronsDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/Dropdown";
import { Button } from "./ui/Button";
import Sidebar from "./Sidebar";
import VoiceAgentPage from "./VoiceButton";

const geistSans = localFont({
  src: "../samarkan-font/samkaran.ttf",
  variable: "--font-geist-sans",
});
function Navbar() {
  return (
    <div className="flex justify-between px-2 lg:px-16 z-[100] md:px-12 py-4 fixed top-0 w-full bg-black">
      <span className="flex items-center lg:gap-20 md:gap-16 sm:gap-12 gap-5">
        {/* <Menu className="text-white" /> */}
        <Sidebar />
        <p
          className={`${geistSans.className} text-orange-400 lg:text-4xl sm:text-3xl text-2xl`}
        >
          Navnirvachan
        </p>
      </span>
      <span className="flex items-center lg:gap-20 md:gap-16 sm:gap-12">
        <VoiceAgentPage />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-transparent text-white border-none text-md sm:text-lg">
              Language
              <ChevronsDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[101]">
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="hindi">Hindi</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bengali">
                Bengali
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="english">
                English
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <Button variant={"outline"} className="px-4 py-2">
          OFF NavIn
        </Button> */}
        <div className="relative sm:inline-flex group hidden">
          <div className="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
          <a
            href="#"
            title="Get quote now"
            className="relative inline-flex items-center justify-center px-4 lg:px-6 py-2 text-md sm:text-lg  font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            role="button"
          >
            OFF NavIn
          </a>
        </div>
      </span>
    </div>
  );
}

export default Navbar;
