"use client";

import ErrorPage from "@/components/ErrorPage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  useDeleteConstituency,
  useGetConstituencyById,
} from "@/hooks/candidateApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2 } from "lucide-react";
import React from "react";

function Page() {
  const {
    data: admins,
    isPending: isVoterPending,
    isError: isVoterError,
  } = useGetCurrentVoter();

  const constituency = admins?.data?.constituency;

  const {
    constituencies: constituencyData,
    isPending: isConstituencyPending,
    isError: isConstituencyError,
    isSuccess: isConstituencySuccess,
  } = useGetConstituencyById(constituency || "");

  const {
    deleteConstituencyAsync,
    isPending: isDeletePending,
  } = useDeleteConstituency();

  const isLoading =
    (isVoterPending || isConstituencyPending || isDeletePending) &&
    !isVoterError &&
    !isConstituencyError;

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        <Loader2 size={50} className="animate-spin" />
      </div>
    );
  }

  if (
    !admins ||
    !constituencyData?.data ||
    isConstituencyError ||
    !isConstituencySuccess
  ) {
    return <ErrorPage />;
  }

  const handleDelete = (id: string) => {
    if (!id) return;
    deleteConstituencyAsync(id);
  };

  return (
    <div className="bg-gray-800 text-white min-h-full pt-14 pb-10 mt-18 px-4 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Manage Constituencies
      </h1>

      {/* Responsive Container */}
      <div
        className="
          w-full max-w-2xl
          bg-gray-800/40 backdrop-blur
          rounded-xl p-6
          flex flex-col gap-6
        "
      >
        <Input
          placeholder="Name"
          value={constituencyData.data.name}
          readOnly
          className="border-2 border-orange-400 h-14"
        />

        <Input
          placeholder="Code"
          value={constituencyData.data.code}
          readOnly
          className="border-2 border-orange-400 h-14"
        />

        <Input
          placeholder="Region"
          value={constituencyData.data.region}
          readOnly
          className="border-2 border-orange-400 h-14"
        />

        <Input
          placeholder="Created At"
          value={
            constituencyData.data.createdAt
              ? new Date(constituencyData.data.createdAt).toLocaleString()
              : ""
          }
          readOnly
          className="border-2 border-orange-400 h-14"
        />

        <Button
          onClick={() => handleDelete(constituencyData.data._id)}
          className="
            w-full bg-red-500 hover:bg-red-600
            rounded-full h-14 text-xl font-bold
            border-b-4 border-red-800 active:border-b-0
          "
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export default Page;
