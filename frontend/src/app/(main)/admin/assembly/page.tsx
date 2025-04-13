"use client";

import DynamicInput from "@/components/DynamicInput";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useCreateAssembly } from "@/hooks/candidateApi";
import React from "react";

function page() {
  const [form, setForm] = React.useState({
    areasUnder: [""],
    name: "",
    state: "",
    location: "",
  });
  const { createAssemblyAsync, isPending } = useCreateAssembly();
  return (
    <div className="bg-gray-700 flex flex-col gap-20 items-center justify-center text-white h-[90vh] mt-20 w-full mx-10">
      <h1 className="text-4xl font-bold text-center">Create Assembly</h1>
      <div className="w-[500px] flex flex-col gap-6">
        <Input
          placeholder="Name"
          name="name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          placeholder="state"
          name="state"
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          placeholder="location"
          name="location"
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <p className="font-bold text-md">Areas under:</p>
        <DynamicInput
          onChange={(areas) => setForm({ ...form, areasUnder: areas })}
        />
        <Button
          disabled={isPending}
          onClick={() => createAssemblyAsync(form)}
          className="bg-orange-400 rounded-full w-full h-14 text-xl border-b-4 border-orange-800 active:border-b-0 hover:bg-orange-500"
        >
          {isPending ? "Creating..." : "Create Assembly"}
        </Button>
      </div>
    </div>
  );
}

export default page;
