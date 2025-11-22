"use client";

import {
  useGetElectionByConstituency,
  useGetElectionProgress,
} from "@/hooks/VoteApi";
import CircularProgress from "./CircularProgress";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

function RightDashboardSidebar() {
  const [open, setOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect breakpoint: md = 768px
  useEffect(() => {
    const handleResize = () => {
      const isNowDesktop = window.innerWidth >= 768;

      setIsDesktop(isNowDesktop);

      if (!isNowDesktop) {
        // Mobile → always open
        setOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    data: currentAdmin,
    isError: isCurrentUserError,
    isPending: isCurrentUserPending,
  } = useGetCurrentVoter();

  const constituency = currentAdmin?.data?.constituency || "";

  const {
    election,
    isPending: isElectionPending,
    isError: isElectionError,
  } = useGetElectionByConstituency(constituency);

  const {
    electionProgress,
    isLoading: isProgressPending,
    isError: isProgressError,
  } = useGetElectionProgress(election?.data?._id || "");

  const loading =
    (isCurrentUserPending || isElectionPending || isProgressPending) &&
    (!isCurrentUserError && !isElectionError && !isProgressError);

  if (loading) {
    return (
      <div className="fixed bottom-0 left-0 w-full bg-gray-700 text-white text-center p-6">
        Loading...
      </div>
    );
  }

  const errorState =
    isCurrentUserError || isElectionError || isProgressError;

  return (
    <>

      {/* Toggle only visible on desktop */}
      {isDesktop && (
        <button
          onClick={() => setOpen(!open)}
          className="
            fixed right-4 top-40
            z-50 bg-gray-700 text-white p-2 
            rounded-l-xl shadow-lg hover:bg-gray-600
          "
        >
          {open ? <ChevronRight /> : <ChevronLeft />}
        </button>
      )}

      {/* Sidebar Wrapper */}
      <div
        className={`
          bg-gray-700 text-white shadow-xl transition-all duration-300 rounded-md p-6
          mt-26
          ${isDesktop
            ? // Desktop → collapsible right
              `fixed ${open ? "right-0" : "-right-80"} h-full top-0 w-96`
            : // Mobile → fixed bottom
              "bottom-0 left-0 w-full h-80"
          }
        `}
      >
        {errorState ? (
          <div className="flex flex-col gap-4 justify-center items-center py-16">
            <h2 className="font-medium text-4xl">Oops!</h2>
            <h4 className="font-medium text-lg">Failed to Fetch</h4>
          </div>
        ) : (
          <>
            <h2 className="font-medium text-xl mb-6">Election Progress</h2>

            {/* Progress Circle */}
            <div className="flex justify-center items-center flex-col mb-10">
              <CircularProgress
                percentage={electionProgress?.data?.percentage}
                size={isDesktop ? 240 : 160}
                strokeWidth={isDesktop ? 18 : 12}
              />
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-300">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {election?.data?.status}
              </li>
            </ul>

            <div className="flex flex-col gap-4">
              <a href={`/result/${election?.data?._id}`}>
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                  See Result
                </button>
              </a>

              <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/elections/manage`}>
                <button className="w-full border border-gray-500 text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-600">
                  Manage Election
                </button>
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default RightDashboardSidebar;
