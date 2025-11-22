"use client";

import CircularProgress from "@/components/CircularProgress";
import ErrorPage from "@/components/ErrorPage";
import ResultGraph from "@/components/ResultGraph";
import { ResultsList } from "@/components/ResultsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetElectionByConstituency,
  useGetElectionProgress,
  useGetTotalVoteCount,
} from "@/hooks/VoteApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function Page() {
  const { data: currentVoter, error, isError, isPending } = useGetCurrentVoter();

  const address = currentVoter?.data?.constituency;

  const { election, isPending: electionIsLoading , error: electionError } =
    useGetElectionByConstituency(address || "");

  const { electionProgress } = useGetElectionProgress(
    election?.data?._id || ""
  );

  const { totalVoteCount, isPending: totalVoteCountIsLoading } =
    useGetTotalVoteCount(election?.data?._id || "");

  // Error handling
  if (isError && !isPending) {
    toast.error(error?.message || "Failed to fetch user");

    return (
      <div className="w-screen h-screen flex justify-center items-center text-white">

      <ErrorPage />
      </div>
    )
  }

  if (electionError && !electionIsLoading) {
    toast.error(electionError?.message || "Failed to fetch election");
    return (
      <div className="w-screen h-screen flex justify-center items-center text-white">

      <ErrorPage /> 
      </div>
    )
  }

  // Loading state
  if (totalVoteCountIsLoading || electionIsLoading || isPending) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-white">
        <Loader2 className="animate-spin" size={50} />
      </div>
    );
  }

  if (!totalVoteCount) {
    return (
      <div className="w-full h-screen flex justify-center items-center text-white">
        <ErrorPage />
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="text-white bg-gray-700 w-full max-w-6xl rounded-3xl p-6 md:p-10 shadow-xl">
        <Tabs defaultValue="account" className="w-full flex flex-col">
          <TabsList className="w-full bg-gray-600 rounded-xl flex justify-center p-2">
            <TabsTrigger value="account" className="text-gray-200">
              Account
            </TabsTrigger>
            <TabsTrigger value="password" className="text-gray-200">
              Candidates
            </TabsTrigger>
          </TabsList>

          {/* ACCOUNT TAB */}
          <TabsContent
            value="account"
            className="flex flex-col gap-10 items-center w-full pt-10"
          >
            {/* Progress Section */}
            <div className="w-full max-w-4xl bg-gray-600 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
              <span className="w-full md:w-1/2">
                <h1 className="text-xl font-bold">
                  Election Progress {electionProgress?.data?.percentage}%
                </h1>

                <div className="h-4 w-full bg-gray-300 rounded-full mt-4">
                  <div
                    className="h-4 bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${electionProgress?.data?.percentage || 0}%`,
                    }}
                  ></div>
                </div>
              </span>

              <div className="flex justify-center md:w-1/2">
                <CircularProgress
                  percentage={electionProgress?.data?.percentage}
                  size={140}
                  strokeWidth={18}
                />
              </div>
            </div>

            {/* Graph Section */}
            <div className="w-full max-w-4xl bg-gray-600 rounded-xl p-4 h-[50vh] min-h-[350px]">
              {/* @ts-ignore */}
              <ResultGraph candidates={totalVoteCount?.data} />
            </div>
          </TabsContent>

          {/* CANDIDATES TAB */}
          <TabsContent
            value="password"
            className="w-full flex justify-center pt-10"
          >
            <div className="w-full max-w-5xl bg-gray-600 rounded-xl p-4 overflow-auto">
              <ResultsList results={totalVoteCount?.data || []} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Page;
