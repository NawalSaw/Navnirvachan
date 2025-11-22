"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export interface AdminTableProps {
  _id: string;
  name: string;
  constituency: string;
  age: number;
  registeredAt: Date;
  phone: string;
  email: string;
  image: string;
  address: string;
  verified: boolean;
}

export function AdminTable({
  admins,
  handleDelete,
}: {
  admins: AdminTableProps[];
  handleDelete: (AdminID: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table className="text-white rounded-full scrollbar-none w-full">
          <TableCaption>A list of your admins.</TableCaption>
          <TableBody>
            {admins.map((admin, index) => (
              <TableRow
                key={index}
                onClick={() => router.push(`/admin/${admin._id}`)}
                className="border-none w-full cursor-pointer"
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <img
                    style={{ objectFit: "cover" }}
                    className="rounded-full h-14 w-14"
                    src={admin.image}
                  />
                </TableCell>
                <TableCell className="font-medium">{admin.name}</TableCell>
                <TableCell>{admin.age}</TableCell>
                <TableCell>
                  {admin.verified ? (
                    <Check className="text-green-500" />
                  ) : (
                    <X className="text-red-500" />
                  )}
                </TableCell>
                <TableCell>
                  <Trash2
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(admin._id);
                    }}
                    className="cursor-pointer text-red-500 hover:text-red-700"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4 mt-4">
        {admins.map((admin, index) => (
          <div
            key={index}
            onClick={() => router.push(`/admin/${admin._id}`)}
            className="bg-gray-800 rounded-xl p-4 flex items-center gap-4 cursor-pointer shadow-lg"
          >
            <img
              className="rounded-full h-16 w-16 object-cover"
              src={admin.image}
            />

            <div className="flex-1">
              <p className="font-bold text-lg">{admin.name}</p>
              <p className="text-sm text-gray-300">Age: {admin.age}</p>
              <p className="text-sm text-gray-300">{admin.email}</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              {admin.verified ? (
                <Check className="text-green-500" />
              ) : (
                <X className="text-red-500" />
              )}

              <Trash2
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(admin._id);
                }}
                className="cursor-pointer text-red-500 hover:text-red-700"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
