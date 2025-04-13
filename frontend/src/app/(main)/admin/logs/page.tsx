"use client"

import EventGraph from "@/components/EventGraph";
import EventTable from "@/components/EventTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetAllEvents } from "@/hooks/VoteApi";
import { Loader2 } from "lucide-react";
import React from "react";

function Page() {
  const { Events, isLoading, isError, error } = useGetAllEvents();
  console.log(Events)
  if (isLoading) {
    return (
      <div className="text-white text-4xl w-[90vw] h-[100vh] flex items-center justify-center">
        <Loader2 size={50} className="animate-spin text-white" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-white text-4xl w-[90vw] h-[100vh] flex items-center justify-center">
        {error?.message}
      </div>
    );
  }

  return (
    <div className="bg-gray-700 flex flex-col gap-10 items-center justify-start text-white h-[90vh] mt-20 w-full mx-10 p-10">
      <h1 className="text-4xl font-bold text-center">Logs</h1>
      <Tabs defaultValue="table" className="w-full flex flex-col items-center">
        <TabsList className="w-[80%] bg-gray-500 flex items-center justify-center">
          <TabsTrigger value="table" className="text-gray-300">
            Table
          </TabsTrigger>
          <TabsTrigger value="graph" className="text-gray-300">
            Graph
          </TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="w-[80%]">
          <div className="mt-16 flex flex-col rounded-2xl h-[600px] scrollbar-none overflow-y-scroll items-center justify-start border border-gray-500 p-5">
            <EventTable events={Events.data} />
          </div>
        </TabsContent>

        <TabsContent value="graph" className="w-[80%]">
          <div className="mt-16 flex flex-col h-[600px] rounded-2xl scrollbar-none overflow-y-scroll items-center justify-start border border-gray-500 p-5">
            {/* @ts-ignore */}
            <EventGraph logs={Events.data} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Page;
