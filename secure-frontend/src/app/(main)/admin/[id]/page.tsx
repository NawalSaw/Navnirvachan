"use client";

import ErrorPage from "@/components/ErrorPage";
import { Input } from "@/components/ui/input";
import { useGetAdmin } from "@/hooks/voterApi";
import { useParams } from "next/navigation";
import React from "react";

function Page() {
  const { id } = useParams();
  const safeId: string = id ? String(id) : "";

  const { data: admin, isLoading, isError } = useGetAdmin(safeId);

  if (isLoading) return <div className="text-white text-center pt-20">Loading...</div>;
  if (isError || !admin) return <ErrorPage />;

  const a = admin.data;

  return (
    <div className="bg-gray-800 flex flex-col gap-10 items-center text-white min-h-full pt-8 w-full px-4 mt-14">

      <h1 className="text-3xl md:text-4xl font-bold text-center">
        Admin Details
      </h1>

      {/* Content wrapper */}
      <div className="w-full max-w-md flex flex-col items-center gap-6">

        {/* Image */}
        <img
          src={a.image}
          alt={a.name}
          className="rounded-full h-40 w-40 object-cover"
        />

        {/* Verified Status */}
        <p className="text-lg">
          {a.verified ? (
            <span className="text-green-400">Verified Admin</span>
          ) : (
            <span className="text-red-400">Unverified Admin</span>
          )}
        </p>

        {/* Registration Date */}
        <p className="text-gray-300">
          Registered: {new Date(a.registeredAt).toLocaleDateString()}
        </p>

        <Input
          placeholder="Name"
          value={a.name}
          readOnly
          className="border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Email"
          value={a.email}
          readOnly
          className="border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Address"
          value={a.address}
          readOnly
          className="border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Phone"
          value={a.phone}
          readOnly
          className="border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Age"
          value={a.age.toString()}
          readOnly
          className="border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Constituency"
          value={a.constituency}
          readOnly
          className="border-2 rounded-lg border-orange-400 h-14"
        />
      </div>
    </div>
  );
}

export default Page;
