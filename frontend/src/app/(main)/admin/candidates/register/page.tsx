"use client";

import FileUpload from "@/components/fileUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useSetCandidate } from "@/hooks/candidateApi";
import { useState } from "react";
import toast from "react-hot-toast";

function page() {
  const { setCandidateAsync, isPending } = useSetCandidate();
  const [formData, setFormData] = useState({
    image: "",
    name: "",
    party: "",
    description: "",
    location: "",
  });

  const handleSubmit = async () => {
    console.log(formData)
    if (
      !formData.name ||
      !formData.party ||
      !formData.description ||
      !formData.location
    ) {
      toast.error("All fields are required");
      return;
    }

    const form = new FormData();
    form.append("image", formData.image);
    form.append("name", formData.name);
    form.append("party", formData.party);
    form.append("description", formData.description);
    form.append("location", formData.location);

    await setCandidateAsync(form);
  };
  return (
    <div className="bg-gray-700 flex flex-col gap-20 items-center justify-center text-white h-[90vh] mt-20 w-full mx-10 p-10">
      <h1 className="text-4xl font-bold text-center">Create Candidates</h1>
      <div className="w-[500px] flex flex-col items-center gap-6">
        {/* @ts-ignore */}
        <FileUpload onUpload={(image) => setFormData({ ...formData, image })} />
        <Input
          placeholder="Name"
          name="name"
          onChange={(e) =>
            setFormData({
              ...formData,
              [e.target.name]: e.target.value,
            })
          }
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          placeholder="Party"
          name="party"
          onChange={(e) =>
            setFormData({
              ...formData,
              [e.target.name]: e.target.value,
            })
          }
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          placeholder="Description"
          name="description"
          onChange={(e) =>
            setFormData({
              ...formData,
              [e.target.name]: e.target.value,
            })
          }
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Input
          placeholder="Location"
          name="location"
          onChange={(e) =>
            setFormData({
              ...formData,
              [e.target.name]: e.target.value,
            })
          }
          className="border-2 rounded-lg border-orange-400 h-14"
        />
        <Button disabled={isPending} onClick={handleSubmit} className="bg-orange-400 rounded-full w-full h-14 text-xl border-b-4 border-orange-800 active:border-b-0 hover:bg-orange-500">
          {isPending? "creating" : "create candidate"}
        </Button>
      </div>
    </div>
  );
}

export default page;
