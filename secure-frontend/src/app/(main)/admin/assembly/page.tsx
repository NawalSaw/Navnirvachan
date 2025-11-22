"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useCreateConstituency } from "@/hooks/candidateApi";
import React from "react";

function Page() {
  const [form, setForm] = React.useState({
    name: "",
    code: "",
    region: "",
  });

  const { createConstituencyAsync, isPending } = useCreateConstituency();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-gray-800 min-h-full pt-18 pb-10 mt-18 text-white flex flex-col items-center px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Create Constituency
      </h1>

      {/* Responsive Form Container */}
      <div
        className="
          w-full max-w-lg 
          bg-gray-800/40 p-6 
          rounded-xl 
          flex flex-col gap-6
        "
      >
        <Input
          placeholder="Name"
          name="name"
          onChange={handleChange}
          value={form.name}
          className="border-2 border-orange-400 h-14"
        />

        <Input
          placeholder="State / Region (optional)"
          name="region"
          onChange={handleChange}
          value={form.region}
          className="border-2 border-orange-400 h-14"
        />

        <Input
          placeholder="Location / Code"
          name="code"
          onChange={handleChange}
          value={form.code}
          className="border-2 border-orange-400 h-14"
        />
        {/* You can hook DynamicInput here later */}
        <Button
          disabled={isPending}
          onClick={() => createConstituencyAsync(form)}
          className="
            bg-orange-400 rounded-full w-full h-14 text-xl font-bold 
            border-b-4 border-orange-800 
            active:border-b-0 hover:bg-orange-500
          "
        >
          {isPending ? "Creating..." : "Create Constituency"}
        </Button>
      </div>
    </div>
  );
}

export default Page;
