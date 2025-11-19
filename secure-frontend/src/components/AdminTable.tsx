"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Check, Cross, Delete } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface AdminTableProps {
  _id: string;
  name: string;
  image: string;
  permanentAddress: string;
  age: string;
  phone: string;
  email: string;
  role: string;
  isVerifiedAdmin: boolean;
  date: Date;
}

export function AdminTable({ admins, handleDelete}: { admins: AdminTableProps[], handleDelete: (AdminID: string) => void }) {
  const router =  useRouter()
  return (
    <Table className="text-white rounded-full scrollbar-none w-full">
      <TableCaption>A list of your recent candidates.</TableCaption>
      <TableBody>
        {admins.map((admin, index) => (
          <TableRow key={index} onClick={() => router.push(`/admin/${admin._id}`)} className="border-none w-full cursor-pointer">
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
                {admin.isVerifiedAdmin ? (
                  <Check className="text-green-500" />
                ) : (
                  <Cross className="text-red-500" />
                )}
              </TableCell>
              <TableCell>
                <Delete onClick={() => handleDelete(admin._id)} className="cursor-pointer text-red-500 hover:text-red-700" />
              </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
