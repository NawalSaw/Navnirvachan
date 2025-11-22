"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import FileUpload from "@/components/fileUpload";
import { useAddAdmin } from "@/hooks/voterApi";
import { toast } from "react-hot-toast";

function Page() {
  const { addAdminAsync, isPending } = useAddAdmin();
  const [AdminData, setAdminData] = useState<{
    image: File | null;
    email: string;
    age: number;
    phone: number;
    address: string;
    name: string;
    constituency: string;
  }>({
    image: null,
    email: "",
    age: 0,
    phone: 0,
    address: "",
    name: "",
    constituency: "",
  });

  const handleCreateAdmin = async () => {
    if (
      !AdminData.name ||
      !AdminData.email ||
      !AdminData.address ||
      !AdminData.phone ||
      !AdminData.age ||
      !AdminData.constituency ||
      !AdminData.image
    ) {
      toast.error("All fields are required");
      return;
    }

    const form = new FormData();

    form.append("image", AdminData.image);
    form.append("name", AdminData.name);
    form.append("email", AdminData.email);
    form.append("address", AdminData.address);
    form.append("phone", AdminData.phone.toString());
    form.append("age", AdminData.age.toString());
    form.append("constituency", AdminData.constituency);

    await addAdminAsync(form);
  };

  return (
   <div className="flex flex-col bg-gray-800 justify-center items-center text-white min-h-full pt-6 mt-15 px-4 mx-10 w-full overflow-hidden">
    <h1 className="text-4xl font-bold text-center mb-10">Create Admin</h1>

    {/* File Upload */}
    <div className="w-full max-w-md mb-10 flex justify-center">
      <FileUpload onUpload={(image) => setAdminData({ ...AdminData, image })} />
    </div>

    {/* Inputs */}
    <div className="w-full max-w-md flex flex-col gap-6">
      <Input
        name="name"
        onChange={(e) =>
          setAdminData({ ...AdminData, [e.target.name]: e.target.value })
        }
        placeholder="Name"
        className="border-2 rounded-lg border-orange-400 h-14"
      />
      <Input
        name="email"
        onChange={(e) =>
          setAdminData({ ...AdminData, [e.target.name]: e.target.value })
        }
        placeholder="Email"
        className="border-2 rounded-lg border-orange-400 h-14"
      />
      <Input
        name="address"
        onChange={(e) =>
          setAdminData({ ...AdminData, [e.target.name]: e.target.value })
        }
        placeholder="Permanent address"
        className="border-2 rounded-lg border-orange-400 h-14"
      />
      <Input
        name="phone"
        onChange={(e) =>
          setAdminData({
            ...AdminData,
            [e.target.name]: Number(e.target.value),
          })
        }
        placeholder="Phone"
        type="number"
        className="border-2 rounded-lg border-orange-400 h-14"
      />
      <Input
        name="age"
        onChange={(e) =>
          setAdminData({
            ...AdminData,
            [e.target.name]: Number(e.target.value),
          })
        }
        placeholder="Age"
        type="number"
        className="border-2 rounded-lg border-orange-400 h-14"
      />
      <Input
        name="constituency"
        onChange={(e) =>
          setAdminData({ ...AdminData, [e.target.name]: e.target.value })
        }
        placeholder="Constituency"
        className="border-2 rounded-lg border-orange-400 h-14"
      />

      <Button
        disabled={isPending}
        onClick={handleCreateAdmin}
        className="bg-orange-400 rounded-full w-full h-14 text-xl border-b-4 border-orange-800 active:border-b-0 hover:bg-orange-500"
      >
        {isPending ? "Creating..." : "Create Admin"}
      </Button>
    </div>
  </div>
  );
}

export default Page;
