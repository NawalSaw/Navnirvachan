"use client";

import DashboardCard from "@/components/DashboardCard";
import Graph from "@/components/Graph";
import {
  useGetAllEvents,
  useGetAllVotes,
  useGetElectionByLocation,
} from "@/hooks/VoteApi";
import { useGetAllVoters, useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2, Paperclip, Proportions, Users } from "lucide-react";

function Page() {
  const { Events, isLoading: isEventPending } = useGetAllEvents();

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

  const { data: voters, isPending: isVoterPending } = useGetAllVoters(
    election?.data.assemblyID || ""
  );
  const { votes, isLoading: isVotePending } = useGetAllVotes(
    election?.data._id || ""
  );

  if (isPending && !isError && !currentAdmin) {
    return (
      <div className="text-white text-4xl w-[90vw] h-[100vh] flex items-center justify-center">
        <Loader2 size={50} className="animate-spin text-white" />
      </div>
    );
  }

  if (!currentAdmin && !isPending && isError) {
    return (
      <div className="text-white text-4xl w-[100vw] h-[100vh] flex items-center justify-center">
        {error?.message}
      </div>
    );
  }

  if (isElectionPending || isVoterPending || isVotePending || isEventPending) {
    return <Loader2 className="text-white animate-spin" size={50} />;
  }

  return (
    <div className="text-white h-[99vh] w-[990px] flex ml-12 mr-5 flex-col gap-10 pt-24">
      <div className="grid grid-cols-3 gap-4">
        <DashboardCard
          label="Total Voters"
          value={String(voters?.data) || "0"}
          bgColor="bg-blue-300"
          icon={<Users size={60} />}
        />
        <DashboardCard
          label="Logs"
          value={String(Events?.data.length) || "0"}
          bgColor="bg-orange-300"
          icon={<Paperclip size={60} />}
        />
        <DashboardCard
          label="Votes"
          value={String(votes?.data.length) || "0"}
          bgColor="bg-purple-300"
          icon={<Proportions size={60} />}
        />
      </div>
      <div className="bg-gray-700 w-full h-full rounded-xl p-2 pt-5">
        <Graph data={votes?.data} />
      </div>
    </div>
  );
}

export default Page;
