"use client";

import { CandidateList } from "@/components/CandidateList";
import CircularProgress from "@/components/CircularProgress";
import ResultGraph from "@/components/ResultGraph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetElectionByLocationAdmin,
  useGetElectionProgress,
  useGetTotalVoteCount,
} from "@/hooks/VoteApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";


function Page() {
  const {
    data: currentVoter,
    error,
    isError,
    isPending,
  } = useGetCurrentVoter();

  const address = currentVoter?.permanentAddress.split(",").at(-3)?.trim();
  
  const { election, isPending: electionIsLoading } =
  useGetElectionByLocationAdmin(address || "");
  
  const { electionProgress } = useGetElectionProgress(election?.data?._id || "");

  const { totalVoteCount, isPending: totalVoteCountIsLoading } =
    useGetTotalVoteCount(election?.data._id || "");

if(isError && !isPending){
    toast.error(error?.message || "failed to fetch the User")
    return (
      <h1>{error?.message || "failed to fetch the User"}</h1>
    )
}
  
  if(totalVoteCountIsLoading || electionIsLoading){
    return (
      <Loader2 />
    )
  }

  if (!totalVoteCountIsLoading && !totalVoteCount){
    return(
      <h1>Failed to Fetch</h1>
    )
  }

  return (
    <div className="w-[100vw] z-[500] h-[99vh] flex items-center justify-center">
      <div
        className="text-white relative h-[90%] bg-gray-700 p-10 rounded-3xl w-[70%] flex flex-col items-center 
    justify-center gap-10"
      >
        <Tabs
          defaultValue="account"
          className="w-full flex flex-col absolute top-10 items-center justify-center"
        >
          <TabsList className="w-[80%]   bg-gray-500 flex items-center justify-center">
            <TabsTrigger value="account" className="text-gray-300">
              Account
            </TabsTrigger>
            <TabsTrigger value="password" className="text-gray-300">
              Password
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="account"
            className={
              "flex pt-10 justify-center gap-10 items-center flex-col w-full"
            }
          >
            <div className="flex justify-around items-center gap-10 w-[80%] bg-gray-600 p-5">
              <span className="w-[50%]">
                <h1 className="text-xl font-bold">Election progress {electionProgress?.data?.percentage}%</h1>
                <div className="h-6 w-[100%] bg-gray-200 rounded-full mt-5">
                  <div className={`h-6 w-[${electionProgress?.data?.percentage}%] bg-blue-500 rounded-full`}></div>
                </div>
              </span>
              <CircularProgress percentage={electionProgress?.data?.percentage} size={150} strokeWidth={20} />
            </div>
            <div className="bg-gray-600 z-[1] w-[80%] h-[50vh] rounded-xl p-2 pt-20">
              {/* @ts-ignore */}
              <ResultGraph candidates={totalVoteCount?.data} />
            </div>
          </TabsContent>
          <TabsContent
            value="password"
            className="flex px-40 pt-20 justify-center h-full gap-10 items-center flex-col w-full"
          >
            <CandidateList
            // @ts-ignore
              candidates={totalVoteCount?.data}
              vote={false}
              showVotes={true}
              deleteButton={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Page;
