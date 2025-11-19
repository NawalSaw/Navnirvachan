"use client";

import { useGetElectionByLocation, useGetElectionProgress } from "@/hooks/VoteApi";
import CircularProgress from "./CircularProgress";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import toast from "react-hot-toast";

function RightDashboardSidebar() {
  const {
    data: currentAdmin,
    error,
    isError,
    isPending,
  } = useGetCurrentVoter();
  const address = currentAdmin?.WorkingAddress;
  const { election, isPending: isElectionPending } = useGetElectionByLocation(
    address || ""
  );
  const { electionProgress } = useGetElectionProgress(election?.data?._id || "");

  if (isPending || isElectionPending && !isError && !currentAdmin || !election) {
    return (
      <h1>loading...</h1>
    )
  }

  if(isError){
    return(
      toast.error(error?.message || "")
    )
  }

  if (!electionProgress) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="bg-gray-700 text-white rounded-lg p-10 mt-24 mr-10 right-0 h-[88vh] shadow-sm max-w-md w-[85%]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-medium text-2xl text-white">Election Progress</h2>
      </div>
      <div className="flex flex-col justify-between h-[90%]">
        <div className="flex justify-center mt-20 mb-10">
          <CircularProgress
            percentage={electionProgress?.data?.percentage}
            size={300}
            strokeWidth={20}
          />
        </div>
        <div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-gray-300">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Completed
            </li>
          </ul>
          <div className="flex flex-col gap-2">
            <a href={`/result/${election.data._id}`}>
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              See Result
            </button>
            </a>
            <a href={`http://localhost:3000/admin/elections/manage`}>
            <button className="w-full border border-gray-500 text-gray-300 hover:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
              Manage Election
            </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightDashboardSidebar;
