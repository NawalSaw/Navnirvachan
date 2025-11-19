"use client"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState } from "react";

interface EventProp {
  event: string;
  location: string;
  date: string;
  description: string;
  ClientDetails: {
    IP: string;
    network: string;
    postal: string;
    timezone: string;
  };
}

function EventTable({ events }: { events: EventProp[] }) {
  const [selectedCandidate, setSelectedCandidate] = useState("");
  return (
      <Table className="text-white scrollbar-none w-full">
         <TableCaption>A list of your recent events.</TableCaption>
         <TableHeader>
           <TableRow>
             <TableHead className="w-[100px] text-white">Serial</TableHead>
             <TableHead className="text-white">Event</TableHead>
             <TableHead className="text-white">Date</TableHead>
             <TableHead className="text-white">Location</TableHead>
             <TableHead className="text-white">IP</TableHead>
             <TableHead className="text-white">Network</TableHead>
             <TableHead className="text-white">Timezone</TableHead>
             <TableHead className="text-white">Postal</TableHead>
             {/* <TableHead className="text-white"></TableHead> */}
           </TableRow>
         </TableHeader>
         <TableBody>
           {events.map((event, index) => (
             <React.Fragment key={index}>
               {/* Main Row */}
               <TableRow
                 onClick={() =>
                   setSelectedCandidate(
                     selectedCandidate === String(index) ? "" : String(index)
                   )
                 }
                 className="z-40 border-none w-full cursor-pointer"
               >
                 <TableCell>{index + 1}</TableCell>
                 <TableCell className="font-medium">{event.event}</TableCell>
                 <TableCell>{event.date}</TableCell>
                 <TableCell>{event.location}</TableCell>
                 <TableCell>{event.ClientDetails.IP}</TableCell>
                 <TableCell>{event.ClientDetails.network}</TableCell>
                 <TableCell>{event.ClientDetails.timezone}</TableCell>
                 <TableCell>{event.ClientDetails.postal}</TableCell>
               </TableRow>
   
               {/* Expandable Description Row with Smooth Transition */}
               <TableRow
                 key={`description-${index}`}
                 className="border-none w-full"
               >
                 <TableCell colSpan={8} className="p-0 w-full">
                   <div
                     className={`overflow-hidden transition-[max-height] duration-600 ease-in-out bg-gray-800 text-gray-300 px-6 w-full`}
                     style={{
                       maxHeight:
                         selectedCandidate === String(index) ? "400px" : "0px",
                     }}
                   >
                     <p className="py-4 break-words whitespace-normal">
                       {event.description}
                     </p>
                   </div>
                 </TableCell>
               </TableRow>
             </React.Fragment>
           ))}
         </TableBody>
       </Table>
  );
}

export default EventTable;
