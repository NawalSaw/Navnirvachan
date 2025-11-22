// components/EventTable.tsx
"use client";

import React from "react";
import  { EventData } from "@/hooks/VoteApi";


export default function EventTable({
  events, 
  onSelect,
}: {
  events: EventData[];
  onSelect: (ev: EventData) => void;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-left divide-y divide-gray-700">
        <caption className="sr-only">Audit Events</caption>
        <thead className="bg-gray-800 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-sm text-gray-300">#</th>
            <th className="px-4 py-3 text-sm text-gray-300">Time</th>
            <th className="px-4 py-3 text-sm text-gray-300">Event</th>
            <th className="hidden md:table-cell px-4 py-3 text-sm text-gray-300">Payload Hash</th>
            <th className="hidden lg:table-cell px-4 py-3 text-sm text-gray-300">Prev Hash</th>
            <th className="px-4 py-3 text-sm text-gray-300 text-right">Action</th>
          </tr>
        </thead>

        <tbody className="bg-gray-800 divide-y divide-gray-600 ">
          {events.map((ev, idx) => (
            <tr
              key={ev._id}
              onClick={() => onSelect(ev)}
              className="hover:bg-gray-600 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-sm text-gray-200">{idx + 1}</td>
              <td className="px-4 py-3 text-sm text-gray-300">
                {new Date(ev.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-white">{ev.eventType}</td>
              <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-300 truncate max-w-[220px]">{ev.payloadHash}</td>
              <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-300 truncate max-w-[220px]">{ev.prevHash}</td>
              <td className="px-4 py-3 text-sm text-right">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(ev); }}
                  className="text-sm px-3 py-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
