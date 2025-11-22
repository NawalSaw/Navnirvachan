"use client";

import { CandidateList } from "@/components/CandidateList";
import ErrorPage from "@/components/ErrorPage";
import { useGetAllCandidatesByConstituency } from "@/hooks/candidateApi";
import { useCastVote, useGetElectionByConstituency, useGetToken } from "@/hooks/VoteApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import BulletinDialog from "@/components/BulletinDialouge"; // ✅ import dialog

const Page = () => {
  const router = useRouter();

  const {
    data: currentVoter,
    isPending: voterLoading,
  } = useGetCurrentVoter();

  const address = currentVoter?.data.constituency || "";

  const { election, isPending: electionIsLoading } =
    useGetElectionByConstituency(address);

  const { data: tokenId } =
    useGetToken(election?.data._id || "", currentVoter?.data.voterId || "");

  const { castVoteAsync } = useCastVote(election?.data._id || "");

  const { candidates, isPending: candidatesIsLoading } =
    useGetAllCandidatesByConstituency(address);

  // ✅ Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

  // ✅ store bulletin response values
  const [ballotId, setBallotId] = useState("");
  const [ballotHash, setBallotHash] = useState("");
  const [bulletinId, setBulletinId] = useState("");

  const handleVote = async (candidateID: string) => {
    if (currentVoter) {
      const response: any = await castVoteAsync({
        constituency: address,
        vote: candidateID,
        tokenId: tokenId?.data || ""
      });

      // ✅ Extract response & show dialog
      if (response?.data) {
        setBallotId(response.data.ballotId);
        setBallotHash(response.data.ballotHash);
        setBulletinId(response.data.bulletinId);

        setDialogOpen(true);
      }
    }
  };

  const handleOk = () => {
    setDialogOpen(false);
    router.push("/success");
  };

  if (!currentVoter && voterLoading) {
    return (
      <div className="w-[100vw] h-[100vh] flex items-center justify-center">
        <Loader2 size={50} className="text-white animate-spin" />
      </div>
    );
  }

  if (!currentVoter && !voterLoading) return <ErrorPage />;

  if (
    candidatesIsLoading ||
    (electionIsLoading && !election) ||
    !candidates?.data
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
        <CandidateList
          handleClick={handleVote}
          deleteButton={false}
          candidates={candidates.data}
        />
      </span>

      {/* ✅ Bulletin Dialog */}
      <BulletinDialog
        open={dialogOpen}
        ballotId={ballotId}
        ballotHash={ballotHash}
        bulletinId={bulletinId}
        handleOk={handleOk}
      />
    </div>
  );
};

export default Page;
