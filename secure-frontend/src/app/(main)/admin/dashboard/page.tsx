"use client";

import DashboardCard from "@/components/DashboardCard";
import ErrorPage from "@/components/ErrorPage";
import Graph from "@/components/Graph";
import {
  useGetAllBulletins,
  useGetAllEvents,
  useGetElectionByConstituency,
} from "@/hooks/VoteApi";

import { useGetAllVoters, useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2, Paperclip, Proportions, Users } from "lucide-react";

function Page() {
  // Fetches
  const { Events, isLoading: isEventPending, isError: isEventError } =
    useGetAllEvents();

  const {
    data: currentAdmin,
    isError: isCurrentUserError,
    isPending,
  } = useGetCurrentVoter();

  const constituency = currentAdmin?.data?.constituency || "";
  const {
    election,
    isPending: isElectionPending,
    isError: isElectionError,
  } = useGetElectionByConstituency(constituency);

  const {
    data: voters,
    isPending: isVoterPending,
    isError: isVoterError,
  } = useGetAllVoters(election?.data?._id || "");

  const {
    bulletins,
    isLoading: isBulletinPending,
    isError: isBulletinError,
  } = useGetAllBulletins(election?.data?._id || "");

  // Determine whether any fetch returned usable data
  const hasCurrentAdminData = Boolean(currentAdmin?.data);
  const hasElectionData = Boolean(election?.data);
  const hasVotersData = Boolean(voters?.data && voters.data.length > 0);
  const hasBulletinsData = Boolean(bulletins?.data && bulletins.data.length > 0);
  const hasEventsData = Boolean(Events?.data && Events.data.length > 0);

  const anyDataAvailable =
    hasCurrentAdminData ||
    hasElectionData ||
    hasVotersData ||
    hasBulletinsData ||
    hasEventsData;

  // Loading: show spinner only if some calls are still pending AND no data available yet
  const anyPending =
    isPending ||
    isElectionPending ||
    isVoterPending ||
    isBulletinPending ||
    isEventPending;

  if (anyPending && !anyDataAvailable) {
    return (
      <div className="text-white text-4xl w-full h-screen flex items-center justify-center">
        <Loader2 size={50} className="animate-spin text-white" />
      </div>
    );
  }

  // Error: show ErrorPage only if there is no usable data at all and the fetches errored / completed without data
  // (i.e., don't show error page if at least one data source succeeded)
  const anyError =
    isCurrentUserError ||
    isElectionError ||
    isVoterError ||
    isBulletinError ||
    isEventError;

  if (!anyDataAvailable && anyError && !anyPending) {
    return <ErrorPage />;
  }

  // At this point: either we have some data (render it), or everything finished successfully with empty results (render with zeros)
  const totalVoters = voters?.data?.length || 0;
  const totalEvents = Events?.data?.length || 0;
  const totalBulletins = bulletins?.data?.length || 0;

  return (
    <div
      className="
        text-white 
        w-full 
        min-h-full
        px-4 sm:px-6 lg:px-10 
        pt-24
        flex flex-col 
        gap-10
      "
    >
      {/* Cards */}
      <div
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          gap-4
        "
      >
        <DashboardCard
          label="Total Voters"
          value={String(totalVoters)}
          bgColor="bg-blue-300"
          icon={<Users className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />}
        />

        <DashboardCard
          label="Logs"
          value={String(totalEvents)}
          bgColor="bg-orange-300"
          icon={<Paperclip className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />}
        />

        <DashboardCard
          label="Votes"
          value={String(totalBulletins)}
          bgColor="bg-purple-300"
          icon={<Proportions className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />}
        />
      </div>

      {/* Graph Container (pass empty array if no bulletins) */}
      <div
        className="
          bg-gray-700 
          w-full 
          rounded-xl 
          p-2 sm:p-4 
          min-h-[300px] 
          md:min-h-[400px] 
          lg:min-h-[500px]
        "
      >
        <Graph data={bulletins?.data || []} />
      </div>
    </div>
  );
}

export default Page;
