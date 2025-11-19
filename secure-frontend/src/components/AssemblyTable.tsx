"use client"

import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "./ui/table";
import { Delete } from "lucide-react";

interface AssemblyTableProps {
  _id: string,
  name: string;
  location: string;
  areasUnder: string[];
  candidates: string[];
  state: string;
}

function AssemblyTable({ assemblies, handleDelete }: { assemblies: AssemblyTableProps[], handleDelete: (id: string) => void }) {
    const [selectedCandidate, setSelectedCandidate] = React.useState<string | null>(null);
  return (
    <Table className="text-white rounded-full h-[300px] scrollbar-none w-full">
      <TableCaption>A list of your recent candidates.</TableCaption>
      <TableBody>
        {assemblies.map((assembly, index) => (
          <React.Fragment key={index}>
            <TableRow key={index} className="border-none w-full cursor-pointer">
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">{assembly.name}</TableCell>
              <TableCell>{assembly.location}</TableCell>
              <TableCell>{assembly.state}</TableCell>
              <TableCell>
                <Delete onClick={() => handleDelete(assembly._id)} className="cursor-pointer text-red-500 hover:text-red-700" />
              </TableCell>
            </TableRow>
            <TableRow
              key={`description-${index}`}
              className="border-none"
            >
              <TableCell colSpan={2} className="p-0">
                <div
                  className={`overflow-hidden transition-[max-height] duration-600 ease-in-out bg-gray-800 text-gray-300 px-6`}
                  style={{
                    maxHeight:
                      selectedCandidate === String(index) ? "400px" : "0px",
                  }}
                >
                  <p className="py-4 break-words whitespace-normal">
                    {assembly.areasUnder}
                  </p>
                </div>
              </TableCell>
              <TableCell colSpan={3} className="p-0">
                <div
                  className={`overflow-hidden transition-[max-height] duration-600 ease-in-out bg-gray-800 text-gray-300 px-6`}
                  style={{
                    maxHeight:
                      selectedCandidate === String(index) ? "400px" : "0px",
                  }}
                >
                  <p className="py-4 break-words whitespace-normal">
                    {assembly.candidates}
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
export default AssemblyTable;
