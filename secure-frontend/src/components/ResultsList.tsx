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

interface ResultsListProps {
  id: string;
  name: string;
  party: string;
  description: string;
  location: string;
  image: string;
  votes: number;
}

export function ResultsList({
  results,
  deleteButton = true,
  handleClick,
}: {
  results: ResultsListProps[];
  deleteButton?: boolean;
  handleClick?: (candidateID: string) => void;
}) {
  const [selectedCandidate, setSelectedCandidate] = useState("");

  return (
    <Table className="text-white scrollbar-none w-full">
      <TableCaption>A list of your recent results.</TableCaption>

      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px] text-white">Serial</TableHead>
          <TableHead className="text-white">Image</TableHead>
          <TableHead className="text-white">Name</TableHead>
          <TableHead className="text-white">Party</TableHead>
          <TableHead className="text-white">Location</TableHead>
          <TableHead className="text-white text-right">Votes</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {results.map((result, index) => (
          <React.Fragment key={result.id}>
            {/* Main Row */}
            <TableRow
              onClick={() =>
                setSelectedCandidate(
                  selectedCandidate === result.id ? "" : result.id
                )
              }
              className="z-40 border-none w-full cursor-pointer"
            >
              <TableCell>{index + 1}</TableCell>

              <TableCell>
                <img
                  style={{ objectFit: "cover" }}
                  className="rounded-full h-14 w-14"
                  src={result.image}
                  alt={result.name}
                />
              </TableCell>

              <TableCell className="font-medium">{result.name}</TableCell>
              <TableCell>{result.party}</TableCell>
              <TableCell>{result.location}</TableCell>

              <TableCell className="text-right flex items-center justify-end gap-3">
                <span>{result.votes}</span>

                {deleteButton && (
                  <ConfirmDialog
                    trigger={
                      <Delete
                        className="text-red-400 hover:text-red-600 cursor-pointer"
                        size={20}
                      />
                    }
                    handleClick={() => handleClick?.(result.id)}
                  />
                )}
              </TableCell>
            </TableRow>

            {/* Expandable Description Row */}
            <TableRow key={`description-${result.id}`} className="border-none">
              <TableCell colSpan={6} className="p-0">
                <div
                  className={`
                    overflow-hidden 
                    transition-[max-height] duration-700 
                    ease-in-out bg-gray-800 text-gray-300 px-6
                  `}
                  style={{
                    maxHeight: selectedCandidate === result.id ? "400px" : "0px",
                  }}
                >
                  <p className="py-4 whitespace-normal break-words">
                    {result.description}
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
