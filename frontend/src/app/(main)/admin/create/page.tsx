"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import FileUpload from "@/components/fileUpload";
import { useAddAdmin } from "@/hooks/voterApi";
import { toast } from 'react-hot-toast';

function page() {
  const { addAdminAsync, isPending } = useAddAdmin();
  const [AdminData, setAdminData] = useState({
    name: "",
    email: "",
    image: "",
    permanentAddress: "",
    phone: 0,
    age: 0,
    WorkingAddress: "",
  });

  const handleCreateAdmin = async () => {
    if (!AdminData.name || !AdminData.email || !AdminData.permanentAddress || !AdminData.phone || !AdminData.age || !AdminData.WorkingAddress) {
      toast.error("All fields are required");
      return
    }

    const form = new FormData();
    form.append("image", AdminData.image);
    form.append("name", AdminData.name);
    form.append("email", AdminData.email);
    form.append("permanentAddress", AdminData.permanentAddress);
    form.append("phone", AdminData.phone.toString());
    form.append("age", AdminData.age.toString());
    form.append("WorkingAddress", AdminData.WorkingAddress);

    await addAdminAsync(form);
  };
  return (
    <div className="bg-gray-700 flex flex-col gap-20 items-center justify-center text-white h-[90vh] mt-20 w-full mx-10">
      <h1 className="text-4xl font-bold text-center">Create Admin</h1>
      <FileUpload onUpload={(image) => setAdminData({ ...AdminData, image })} />
      <div className="w-[500px] flex flex-col gap-6">
        <Input
          name={"name"}
          onChange={(e) => setAdminData({ ...AdminData, [e.target.name]: e.target.value })}
          placeholder="Name"
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          name={"email"}
          onChange={(e) => setAdminData({ ...AdminData, [e.target.name]: e.target.value })}
          placeholder="Email"
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          name={"permanentAddress"}
          onChange={(e) => setAdminData({ ...AdminData, [e.target.name]: e.target.value })}
          placeholder="Parmanent address"
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          name={"phone"}
          onChange={(e) => setAdminData({ ...AdminData, [e.target.name]: e.target.value })}
          placeholder="Phone"
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          name={"age"}
          onChange={(e) => setAdminData({ ...AdminData, [e.target.name]: e.target.value })}
          placeholder="Age"
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          name="WorkingAddress"
          onChange={(e) => setAdminData({ ...AdminData, [e.target.name]: e.target.value })}
          placeholder="Working Address"
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Button disabled={isPending} onClick={handleCreateAdmin} className="bg-orange-400 rounded-full w-full h-14 text-xl border-b-4 border-orange-800 active:border-b-0 hover:bg-orange-500">
         {isPending ? "Creating..." : "Create Admin"}
        </Button>
      </div>
    </div>
  );
}

export default page;
