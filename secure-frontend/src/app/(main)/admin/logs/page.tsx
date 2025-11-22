"use client"

import ErrorPage from "@/components/ErrorPage";
import EventDetailsSidebar from "@/components/EventDetailsSidebar";
import EventTable from "@/components/EventTable";
import { EventData, useGetAllEvents } from "@/hooks/VoteApi";
import { Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";

function Page() {
  const { Events, isLoading, isError, error } = useGetAllEvents();
const [selected, setSelected] = useState<EventData | null>(null);
  const events = Events?.data || []
  const sorted = useMemo(() => {
    if (!events) return [];
    return [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [events]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-800">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <ErrorPage/>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-900 text-white p-4 md:p-8 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr,auto] gap-6">
        <div className="bg-gray-700 rounded-xl p-4 ">
          <h2 className="text-2xl font-bold mb-4">Audit Log</h2>
          <EventTable events={sorted} onSelect={(e) => setSelected(e)} />
        </div>

        {/* On wide screens we keep the sidebar visible area reserved */}
        <div className="hidden md:block">
          <div className="w-96">
            {/* small static hint panel when nothing selected */}
            {!selected ? (
              <div className="bg-gray-700 rounded-xl p-4 h-full w-full">
                <h3 className="font-semibold">Details</h3>
                <p className="text-sm text-gray-300 mt-2">
                  Click any row to view block details: hash chain, signature, and payload.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Sidebar / bottom drawer */}
      <EventDetailsSidebar event={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default Page;
