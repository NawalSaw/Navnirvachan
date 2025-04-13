"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useCreateElection } from "@/hooks/VoteApi";
import { Loader2 } from "lucide-react";
import { useState } from "react";

function page() {
  const [electionData, setElectionData] = useState({
    name: "",
    location: "",
  });
  const { createElectionAsync, isPending } =
    useCreateElection();

  return (
    <div className="bg-gray-700 flex flex-col gap-20 items-center justify-center text-white h-[90vh] mt-20 w-full mx-10">
      <h1 className="text-4xl font-bold text-center">Create Election</h1>
      <div className="w-[500px] flex flex-col gap-6">
        <Input
          name={"name"}
          onChange={(e) =>
            setElectionData({
              ...electionData,
              [e.target.name]: e.target.value,
            })
          }
          placeholder="Name"
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          name={"location"}
          onChange={(e) =>
            setElectionData({
              ...electionData,
              [e.target.name]: e.target.value,
            })
          }
          placeholder="Location"
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Button
          onClick={() => createElectionAsync(electionData)}
          className="bg-orange-400 rounded-full w-full h-14 text-xl border-b-4 border-orange-800 active:border-b-0 hover:bg-orange-500"
        >
          {isPending ? <Loader2 className="animate-spin" /> : "Create Election"}
        </Button>
      </div>
    </div>
  );
}

export default page;
