"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/Button";
import React, { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { Delete } from "lucide-react";

interface CandidateListProps {
  _id: string;
  name: string;
  party: string;
  description: string;
  image: string;
  location: string;
  votes?: number;
}

export function CandidateList({
  candidates,
  vote = true,
  showVotes = false,
  deleteButton = true,
  handleClick,
}: {
  candidates: CandidateListProps[];
  vote?: boolean;
  showVotes?: boolean;
  deleteButton?: boolean;
  handleClick?: (candidateID: string) => void;
}) {
  const [selectedCandidate, setSelectedCandidate] = useState("");

  return (
    <Table className="text-white scrollbar-none w-full">
      <TableCaption>A list of your recent candidates.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px] text-white">Serial</TableHead>
          <TableHead className="text-white">Image</TableHead>
          <TableHead className="text-white">Name</TableHead>
          <TableHead className="text-white">Party</TableHead>
          <TableHead className="text-white">Location</TableHead>
          <TableHead className="text-white text-right">Vote</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate, index) => (
          <React.Fragment key={candidate._id || index}>
            {/* Main Row */}
            <TableRow
              onClick={() =>
                setSelectedCandidate(
                  selectedCandidate === candidate._id ? "" : candidate._id
                )
              }
              className="z-40 border-none w-full cursor-pointer"
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <img
                  style={{ objectFit: "cover" }}
                  className="rounded-full h-14 w-14"
                  src={candidate.image}
                />
              </TableCell>
              <TableCell className="font-medium">{candidate.name}</TableCell>
              <TableCell>{candidate.party}</TableCell>
              <TableCell>{candidate.location}</TableCell>
              <TableCell className="text-right flex items-center justify-end">
                {vote && (
                  <ConfirmDialog
                    handleClick={() => handleClick?.(candidate._id)}
                    // link="/success"
                    trigger={
                      <Button className="bg-orange-400 w-[100px] border-b-4 mt-2 rounded-full active:border-b-0 hover:bg-amber-600 transition-all duration-200 border-b-orange-700 text-md font-bold">
                        Vote
                      </Button>
                    }
                  />
                )}
                {!vote && (
                  <Delete
                    onClick={() => handleClick?.(candidate._id)}
                    className={`text-red-400 hover:text-red-600 ${
                      deleteButton ? "block" : "hidden"
                    }`}
                    size={20}
                  />
                )}
                {showVotes && (
                  <div className="h-full flex items-center">
                    {candidate?.votes}
                  </div>
                )}
              </TableCell>
            </TableRow>

            {/* Expandable Description Row with Smooth Transition */}
            <TableRow
              key={`description-${candidate._id}`}
              className="border-none"
            >
              <TableCell colSpan={6} className="p-0">
                <div
                  className={`overflow-hidden transition-[max-height] duration-600 ease-in-out bg-gray-800 text-gray-300 px-6`}
                  style={{
                    maxHeight:
                      selectedCandidate === candidate._id ? "400px" : "0px",
                  }}
                >
                  <p className="py-4 break-words whitespace-normal">
                    {candidate.description}
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
