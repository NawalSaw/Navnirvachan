"use client";

import React from "react";
import { CandidateList } from "@/components/CandidateList";
import {
  useDeleteCandidate,
  useGetAllCandidatesByLocation,
} from "@/hooks/candidateApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2 } from "lucide-react";

function page() {
  const {
    data: currentAdmin,
    error,
    isError,
    isPending,
  } = useGetCurrentVoter();

  const address = currentAdmin?.WorkingAddress;
  const { candidates, isPending: isVoterPending } =
    useGetAllCandidatesByLocation(address || "");

  const { deleteCandidateAsync } = useDeleteCandidate();

  console.log(candidates)
  if (
    (isPending && !isError && !currentAdmin) ||
    (isVoterPending && !candidates)
  ) {
    return (
      <div className="text-white text-4xl w-[90vw] h-[100vh] flex items-center justify-center">
        <Loader2 size={50} className="animate-spin text-white" />
      </div>
    );
  }

  if (
    (!candidates && !isVoterPending || !candidates.data)
  ) {
    return (
      <div className="text-white text-4xl w-[90vw] h-[100vh] flex items-center justify-center">
        Error: {error?.message? error.message : "No candidate found"}
      </div>
    );
  }

  const handleClick = (candidateID: string) => {
    if (currentAdmin) {
      deleteCandidateAsync(candidateID);
    }
  };
  return (
    <div className="bg-gray-700 flex flex-col gap-20 items-center justify-center text-white h-[90vh] mt-20 w-full mx-10 p-10">
      <h1 className="text-4xl font-bold text-center">Manage Candidates</h1>
      <div className="w-[800px] h-[800px] overflow-y-scroll scrollbar-none flex flex-col gap-6">
        <CandidateList
          handleClick={handleClick}
          vote={false}
          candidates={candidates.data}
        />
      </div>
    </div>
  );
}

export default page;
