"use client";

import FileUpload from "@/components/fileUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useSetCandidate } from "@/hooks/candidateApi";
import { useState } from "react";
import toast from "react-hot-toast";

function Page() {
  const { setCandidateAsync, isPending } = useSetCandidate();

  const [formData, setFormData] = useState({
    constituency: "",
    name: "",
    party: "",
    candidateCode: "",
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.party ||
      !formData.candidateCode ||
      !formData.constituency ||
      !formData.image
    ) {
      toast.error("All fields are required");
      return;
    }

    const form = new FormData();
    form.append("image", formData.image);
    form.append("name", formData.name);
    form.append("party", formData.party);
    form.append("candidateCode", formData.candidateCode);
    form.append("constituency", formData.constituency);

    await setCandidateAsync(form);
  };

  return (
    <div className="bg-gray-800 min-h-full w-full text-white flex flex-col items-center pt-12 mt-15 px-4">

      {/* PAGE TITLE */}
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Create Candidate
      </h1>

      {/* FORM CONTAINER */}
      <div className="w-full max-w-md flex flex-col items-center gap-6">

        {/* IMAGE UPLOAD */}
        <FileUpload onUpload={(image) => setFormData({ ...formData, image })} />

        {/* INPUTS */}
        <Input
          placeholder="Name"
          name="name"
          onChange={handleChange}
          className="border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Party"
          name="party"
          onChange={handleChange}
          className="border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Candidate Code"
          name="candidateCode"
          onChange={handleChange}
          className="border-2 rounded-lg border-orange-400 h-14"
        />

        <Input
          placeholder="Constituency"
          name="constituency"
          onChange={handleChange}
          className="border-2 rounded-lg border-orange-400 h-14"
        />

        {/* SUBMIT BUTTON */}
        <Button
          disabled={isPending}
          onClick={handleSubmit}
          className="bg-orange-400 rounded-full w-full h-14 text-xl border-b-4 border-orange-800 active:border-b-0 hover:bg-orange-500"
        >
          {isPending ? "Creating..." : "Create Candidate"}
        </Button>
      </div>
    </div>
  );
}

export default Page;
