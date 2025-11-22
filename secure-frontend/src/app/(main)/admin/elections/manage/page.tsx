"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useDeleteElection, useGetElectionByConstituency } from "@/hooks/VoteApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import React from "react";
import { Loader2 } from "lucide-react";
import ErrorPage from "@/components/ErrorPage";

function Page() {
  const {
    data: currentAdmin,
    error,
    isError,
    isPending,
  } = useGetCurrentVoter();

  const address = currentAdmin?.data.constituency;

  const {
    election,
    isPending: isElectionPending,
    isError: isElectionError,
  } = useGetElectionByConstituency(address || "");

  const {
    deleteElectionAsync,
    isPending: isPendingDelete,
    isError: isDeleteError,
  } = useDeleteElection();

  if (
    (!isError && isElectionPending) ||
    (!isDeleteError && isPendingDelete)
  ) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={50} className="animate-spin text-white" />
      </div>
    );
  }

  if (
    (isError && !isElectionPending) ||
    (isDeleteError && !isPendingDelete) ||
    !election?.data
  ) {
    return <ErrorPage />;
  }

  const data = election?.data;
  const handleDeleteElection = (electionId: string) => {
    if (!electionId) return;
    deleteElectionAsync(electionId);
  };

  return (
    <div className="
      bg-gray-800 text-white
      flex flex-col items-center
      w-full px-4 md:px-8 lg:px-10
      py-20 gap-10 min-h-full mt-14
    ">
      
      <h1 className="text-3xl md:text-4xl font-bold text-center">
        Manage Election
      </h1>

      <div className="w-full max-w-lg flex flex-col gap-6">

        <Input
          placeholder="Name"
          value={data?.name || ""}
          readOnly
          className="disabled border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Description"
          value={data?.description || ""}
          readOnly
          className="disabled border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Start Date"
          value={data?.startDate || ""}
          readOnly
          className="disabled border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="End Date"
          value={data?.endDate || ""}
          readOnly
          className="disabled border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Code"
          value={data?.code || ""}
          readOnly
          className="disabled border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Status"
          value={data?.status || ""}
          readOnly
          className="disabled border-2 rounded-lg border-orange-400 h-14"
        />

        {data?.constituencies?.length && data?.constituencies.length > 0 && (
          <div className="bg-gray-800 p-3 rounded-lg text-sm md:text-base">
            <p className="font-semibold mb-2">Constituencies:</p>
            <ul className="list-disc pl-5 max-h-40 overflow-auto scrollbar-hidden">
              {data.constituencies.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Button Section */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <Button
            onClick={() => handleDeleteElection(data?._id || "")}
            className="
              bg-red-400 rounded-full w-full h-14 text-xl
              border-red-800 border-b-4 active:border-b-0
              hover:bg-red-500
            "
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Page;
