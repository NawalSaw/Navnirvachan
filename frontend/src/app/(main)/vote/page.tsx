"use client";

import { CandidateList } from "@/components/CandidateList";
import { useGetAllCandidatesByLocation } from "@/hooks/candidateApi";
import { useCastVote, useGetElectionByLocation } from "@/hooks/VoteApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const {
    data: currentVoter,
    isPending: voterLoading,
    isError,
    error,
  } = useGetCurrentVoter();

  // Get the location from the voter
  const address = currentVoter?.permanentAddress.split(",").at(-3)?.trim();

  // 🔥 Use hook correctly — at the top level
  const { election, isPending: electionIsLoading } = useGetElectionByLocation(
    address || ""
  );
  const { candidates, isPending: candidatesIsLoading } =
    useGetAllCandidatesByLocation(address || "");
  const { castVoteAsync } = useCastVote();
  const router = useRouter();
  const handleVote = (candidateID: string) => {
    if (currentVoter) {
      castVoteAsync({ voterID: currentVoter._id, candidateID });
      router.push("/success");
    }
  };

  if (!currentVoter && voterLoading) {
    return (
      <div className="w-[100vw] h-[100vh] flex items-center justify-center">
        <Loader2 size={50} className="text-white animate-spin" />
      </div>
    );
  }

  if (!currentVoter && !voterLoading) {
    return (
      <div className="text-white text-4xl w-[100vw] h-[100vh] flex items-center justify-center">
        <h1 className="mt-52">
          {isError ? error?.message : "Voter not found"}
        </h1>
      </div>
    );
  }

  if (
    candidatesIsLoading ||
    (electionIsLoading && !election) ||
    !candidates.data
  ) {
    return (
      <div className="w-[100vw] h-[100vh] flex items-center justify-center">
        <Loader2 size={50} className="text-white animate-spin" />
      </div>
    );
  }

  if (!election && !electionIsLoading) {
    return (
      <div className="text-white text-4xl w-[100vw] h-[100vh] flex items-center justify-center">
        <h1>Election not found</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="font-bold text-4xl mt-20 text-white text-center mb-10">
        Vote
      </h1>
      <span className="w-[60%] flex justify-center h-[80vh] overflow-y-scroll scrollbar-none">
        <CandidateList handleClick={handleVote} candidates={candidates.data} />
      </span>
    </div>
  );
};

export default Page;
