"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useDeleteElection, useGetElectionByLocationAdmin, useToggleElection } from "@/hooks/VoteApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import React from "react";
import { Loader2 } from 'lucide-react';

/**
 * Page to manage elections
 *
 * This page displays a table of all available elections and allows the user to start or stop an election.
 * The table is populated from the `Elections` array defined above.
 * The `handleToggleElection` function is a placeholder and should be replaced with a function that makes an API call to start or stop an election.
 * The `elections` prop is an array of election objects, each with a `name`, `location`, `isStarted` and `date` property.
 */
function page() {
    const {
      data: currentAdmin,
      error,
      isError,
      isPending,
    } = useGetCurrentVoter();
    const address = currentAdmin?.WorkingAddress;
    const { election, isPending: isElectionPending } = useGetElectionByLocationAdmin(
      address || ""
    );
    console.log(election);

  const { toggleElectionAsync, isPending: isPendingToggle } =
    useToggleElection();
  const { deleteElectionAsync, isPending: isPendingDelete } =
    useDeleteElection();

  // Watch cache for currentElection and update electionId

  if(!election && isElectionPending || !currentAdmin && isPending) {
    return(
      <Loader2 size={50} className="animate-spin text-white" />
    )
  }

  if (!election && !isElectionPending || !currentAdmin && !isPending) {
    return (
      <div className="text-white text-4xl w-[90vw] h-[100vh] flex items-center justify-center">
        {isError ? error?.message : "No election found or your are not authorised"}
      </div>
    )
  }
  const handleToggleElection = (electionId: string) => {
    if (!electionId) return;
    toggleElectionAsync(electionId);
  };
  const handleDeleteElection = (electionId: string) => {
    if (!electionId) return;
    deleteElectionAsync(electionId);
  };
  return (
    <div className="bg-gray-700 flex flex-col gap-10 items-center justify-center text-white h-[90vh] mt-20 w-full mx-10 p-10">
      <h1 className="text-4xl font-bold text-center">Manage Election</h1>
      <Input
        placeholder="Name"
        value={election.data.name}
        readOnly
        className="disabled border-2 rounded-lg border-orange-400 h-14"
      />
      <Input
        placeholder="Location"
        value={election.data.location}
        readOnly
        className="disabled border-2 rounded-lg border-orange-400 h-14"
      />
      <Input
        placeholder="Date"
        value={String(new Date())}
        readOnly
        className="disabled border-2 rounded-lg border-orange-400 h-14"
      />
      <div className="flex gap-10 w-full">
      {election.data.isStarted ? (
        <Button
          onClick={() => handleToggleElection(election.data._id)}
          className="bg-green-400 rounded-full w-full h-14 text-xl border-green-800 border-b-4 active:border-b-0 hover:bg-green-500"
        >
          Running
        </Button>
      ) : (
        <Button
          onClick={() => handleToggleElection(election.data._id)}
          className="bg-red-400 rounded-full w-full h-14 text-xl border-red-800 border-b-4 active:border-b-0 hover:bg-red-500"
        >
          Stopped
        </Button>
      )}
      <Button
        onClick={() => handleDeleteElection(election.data._id)}
        className="bg-red-400 rounded-full w-full h-14 text-xl border-red-800 border-b-4 active:border-b-0 hover:bg-red-500"
      >
        Delete
      </Button></div>
    </div>
  );
}

export default page;
