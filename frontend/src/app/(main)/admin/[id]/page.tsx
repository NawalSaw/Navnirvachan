"use client";

import { Input } from "@/components/ui/input";
import { useGetAdmin } from "@/hooks/voterApi";
import { useParams } from "next/navigation";
import React from "react";

// const admin = {
//   id: "asdlfjaslfksjfls",
//   name: "Jane Doe", //
//   image: "https://picsum.photos/201", //
//   permanentAddress: "456 Elm St, Othertown, USA", //
//   age: "30", //
//   phone: "987-654-3210", //
//   email: "jane.doe@example.com", //
//   role: "admin",
//   isVerifiedAdmin: false,
//   date: new Date(),
// };

function Page() {
  const { id } = useParams();
  const safeId: string = id ? String(id) : "";
  console.log(id)
  const { data: admin, isLoading, isError, error } = useGetAdmin(safeId);
  console.log(admin)

  if (isLoading) return <div>Loading...</div>;
  if (isError && !isLoading && !admin) return <div>{error?.message || "Something went wrong"}</div>;
  return (
    <div className="bg-gray-700 flex flex-col gap-20 items-center justify-center text-white h-[90vh] mt-20 w-full mx-10">
      <h1 className="text-4xl font-bold text-center">Admin Details</h1>
      <div className="w-[500px] flex flex-col items-center gap-6">
        <img
          style={{ objectFit: "cover" }}
          className="rounded-full h-40 w-40"
          src={admin?.data.image}
        />
        <p>
          {admin?.data?.date || "Unverified Admin"}
        </p>
        <Input
          placeholder="Name"
          value={admin?.data?.name || ""}
          readOnly
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          placeholder="Email"
          className="border-2 rounded-lg border-orange-400 h-14"
          readOnly
          value={admin?.data?.email || ""}
        />
        <Input
          placeholder="Parmanent address"
          readOnly
          className="border-2 rounded-lg border-orange-400 h-14"
          value={admin?.data?.permanentAddress || ""}
        />
        <Input
          placeholder="Phone"
          readOnly
          className="border-2 rounded-lg border-orange-400 h-14"
          value={admin?.data?.phone || ""}
        />
        <Input
          placeholder="Age"
          readOnly
          className="border-2 rounded-lg border-orange-400 h-14"
          value={admin?.data?.age || ""}
        />
      </div>
    </div>
  );
}

export default Page;
