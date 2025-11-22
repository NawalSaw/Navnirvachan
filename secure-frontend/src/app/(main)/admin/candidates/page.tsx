"use client";

import React from "react";
import { CandidateList } from "@/components/CandidateList";
import {
  useDeleteCandidate,
  useGetAllCandidatesByConstituency,
} from "@/hooks/candidateApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2 } from "lucide-react";
import ErrorPage from "@/components/ErrorPage";

function Page() {
  const {
    data: currentAdmin,
    isPending: isAdminLoading,
    isError: isAdminError,
  } = useGetCurrentVoter();

  const constituency = currentAdmin?.data?.constituency || "";
  const {
    candidates,
    isPending: isCandidatesLoading,
    isError: isCandidatesError,
  } = useGetAllCandidatesByConstituency(constituency);
console.log(candidates);
  const { deleteCandidateAsync, isPending: isDeletePending } =
    useDeleteCandidate();

  // LOADING STATE
  if (isAdminLoading || isCandidatesLoading) {
    return (
      <div className="text-white text-4xl w-full h-screen flex items-center justify-center">
        <Loader2 size={50} className="animate-spin" />
      </div>
    );
  }

  // ERROR STATE
  if (
    isAdminError ||
    isCandidatesError ||
    !currentAdmin ||
    !candidates ||
    !candidates.data
  ) {
    return <ErrorPage />;
  }

  const handleClick = (candidateID: string) => {
    deleteCandidateAsync(candidateID);
  };

  return (
    <div className="bg-gray-800 min-h-full w-full text-white pt-14 px-4 flex flex-col items-center mt-18">

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Manage Candidates
      </h1>

      {/* Scrollable List Container */}
      <div className="w-full max-w-3xl h-[60vh] md:h-[70vh] overflow-y-auto scrollbar-none rounded-lg flex flex-col gap-6 p-4 bg-gray-600/40">

        <CandidateList
          handleClick={handleClick}
          candidates={candidates.data}
        />
      </div>
    </div>
  );
}

export default Page;
