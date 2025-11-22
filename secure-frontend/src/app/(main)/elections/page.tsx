"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { useGetElectionByConstituency, useIssueToken } from "@/hooks/VoteApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-500",
  ongoing: "bg-green-500",
  completed: "bg-gray-500",
};

interface ElectionProps {
  _id: string;
  name: string;
  code: string;
  description: string;
  startDate: Date;
  endDate: Date;
  constituencies: string;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

function Page() {
  const {
    data,
    isPending: isCurrentUserPending,
    isError: isCurrentUserError,
    error: currentUserError,
  } = useGetCurrentVoter();
  const router = useRouter();
  const constituency = data?.data?.constituency || "";

  const {
    election,
    isPending: electionIsLoading,
    isError: isElectionError,
    error: electionError,
  } = useGetElectionByConstituency(constituency);
  const electionData = election?.data || ({} as ElectionProps);

  const { issueTokenAsync, isPending: isIssueTokenPending } = useIssueToken(
    electionData?._id || "",
    data?.data?.voterId || ""
  );

  if (
    (isCurrentUserPending || electionIsLoading) &&
    !isCurrentUserError &&
    !isElectionError
  ) {
    return (
      <div className="text-white text-2xl w-full h-screen flex items-center justify-center px-4">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  if (isCurrentUserError || isElectionError) {
    return (
      <div className="text-white w-full h-screen flex items-center justify-center px-4">
        <div className="flex flex-col p-6 w-full max-w-xl rounded-md gap-6 items-center justify-center bg-gray-800 text-center">
          <h1 className="text-3xl font-bold">Elections</h1>
          <p className="text-xl font-bold">
            {isCurrentUserError
              ? currentUserError?.message
              : electionError?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white flex flex-col lg:flex-row gap-8 w-full min-h-screen p-6 items-center justify-center">
      <span className="flex flex-col gap-4 text-center lg:text-left max-w-xl">
        <h1 className="text-3xl lg:text-4xl font-bold">{electionData.name}</h1>
        <Badge
          className={`text-md font-semibold ${
            statusColors[electionData?.status || ""]
          } w-fit mx-auto lg:mx-0`}
        >
          Status: {electionData.status}
        </Badge>
        <p className="text-lg lg:text-xl opacity-80">
          {electionData.description}
        </p>

        <div className="text-sm lg:text-md opacity-80 space-y-1 mt-2 text-left mx-auto lg:mx-0">
          <p>
            <strong>Code:</strong> {electionData.code}
          </p>
          <p>
            <strong>Constituencies:</strong>{" "}
            {/* @ts-ignore */}
            {electionData?.constituencies?.map((c) => c.name).join(", ")}
          </p>
          <p>
            <strong>Start Date:</strong>{" "}
            {new Date(electionData.startDate).toLocaleString()}
          </p>
          <p>
            <strong>End Date:</strong>{" "}
            {new Date(electionData.endDate).toLocaleString()}
          </p>
          <p>
            <strong>Created At:</strong>
            {new Date(electionData?.createdAt || new Date()).toLocaleString()}
          </p>
          <p>
            <strong>Updated At:</strong>{" "}
            {new Date(electionData?.updatedAt || new Date()).toLocaleString()}
          </p>
        </div>

        <Button
          onClick={async () => {
            await issueTokenAsync();
            router.push(`/elections/${electionData._id}`);
          }}
          className="w-full lg:w-1/2 h-12 bg-amber-600 text-lg mt-2 hover:bg-amber-700"
        >
          {isIssueTokenPending ? "Loading..." : "Vote Now"}
        </Button>
      </span>

      <Image
        src="/election_machine-removebg-preview.png"
        alt="election"
        width={600}
        height={600}
        className="rounded-lg w-3/4 lg:w-1/2 "
      />
    </div>
  );
}

export default Page;
