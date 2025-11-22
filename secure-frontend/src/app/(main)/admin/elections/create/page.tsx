"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useCreateElection } from "@/hooks/VoteApi";
import { Loader2 } from "lucide-react";
import { useState } from "react";

function Page() {
  const [electionData, setElectionData] = useState({
    code: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    constituenciesNames: [] as string[],
  });

  const [constituencyInput, setConstituencyInput] = useState("");

  const { createElectionAsync, isPending } = useCreateElection();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setElectionData({
      ...electionData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddConstituency = () => {
    if (!constituencyInput.trim()) return;
    setElectionData({
      ...electionData,
      constituenciesNames: [...electionData.constituenciesNames, constituencyInput.trim()],
    });
    setConstituencyInput("");
  };

  return (
    <div className="bg-gray-800 flex flex-col gap-12 items-center justify-center text-white min-h-full overflow-hidden mt-20 px-4">
      
      <h1 className="text-3xl md:text-4xl font-bold text-center">Create Election</h1>

      <div className="w-full max-w-xl flex flex-col md:flex-row gap-6">
        <span className="flex-1 flex flex-col gap-2">
        <Input
          name="code"
          onChange={handleChange}
          placeholder="Election Code"
          className="border-2 rounded-lg border-orange-400 h-14 text-white"
        />

        <Input
          name="name"
          onChange={handleChange}
          placeholder="Election Name"
          className="border-2 rounded-lg border-orange-400 h-14 text-white"
        />

        <Input
          name="description"
          onChange={handleChange}
          placeholder="Description"
          className="border-2 rounded-lg border-orange-400 h-14 text-white"
        />

        <Input
          type="date"
          name="startDate"
          onChange={handleChange}
          className="border-2 rounded-lg border-orange-400 h-14 text-gray-500"
        />

        <Input
          type="date"
          name="endDate"
          onChange={handleChange}
          className="border-2 rounded-lg border-orange-400 h-14 text-gray-500"
        />

        {/* Constituency Entry */}
        <div className="flex gap-2">
          <Input
            value={constituencyInput}
            onChange={(e) => setConstituencyInput(e.target.value)}
            placeholder="Add Constituency"
            className="border-2 rounded-lg border-orange-400 h-14 text-white flex-1"
          />
          <Button
            onClick={handleAddConstituency}
            className="bg-blue-500 rounded-lg h-14"
          >
            Add
          </Button>
          </div>
                <Button
          disabled={isPending}
          onClick={() => createElectionAsync(electionData)}
          className="
          bg-orange-400 rounded-full w-full h-14 text-xl 
          border-b-4 border-orange-800 active:border-b-0 
            hover:bg-orange-500
          "
        >
          {isPending ? <Loader2 className="animate-spin" /> : "Create Election"}
        </Button>
        </span>
        <span>
        {/* Display Added Constituencies */}
        {electionData.constituenciesNames.length > 0 && (
          <div className="text-md bg-gray-800 p-3 rounded-lg">
            <p className="font-semibold mb-2">Constituencies:</p>
            <ul className="list-disc pl-5 h-40 overflow-auto scrollbar-hidden">
              {electionData.constituenciesNames.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

  
          </span>
      </div>
    </div>
  );
}

export default Page;
