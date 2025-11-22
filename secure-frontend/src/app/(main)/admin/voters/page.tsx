"use client";

import { Button } from "@/components/ui/Button";
import { useAddVotersInVoterlist } from "@/hooks/voterApi";
import { useState } from "react";
import toast from "react-hot-toast";

function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const { addVoter, isPending, isError, error } = useAddVotersInVoterlist();

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile && droppedFile.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = JSON.parse(text);
          setFile(droppedFile);
          setPreviewData(parsed);
        } catch (err) {
          toast.error("Invalid JSON file");
        }
      };
      reader.readAsText(droppedFile);
    } else {
      toast.error("Please upload a valid JSON file.");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("data", file);

    await addVoter(formData);

    if (isError) {
      toast.error(error?.message || "Failed to add voters");
      console.error(error);
    } else {
      toast.success("Voters uploaded successfully");
    }

    setFile(null);
    setPreviewData(null);
  };
return (
  <div className="bg-gray-800 min-h-full w-full text-white flex flex-col items-center pt-15 px-4 mt-18">

    {/* TITLE */}
    <div className="text-center space-y-2 mb-6">
      <h1 className="text-3xl md:text-4xl font-bold">Upload Voter</h1>
      <p className="text-gray-300">Upload the voter list data in JSON format</p>

      {file && (
        <Button
          onClick={handleUpload}
          className="bg-orange-400 rounded-full mt-4 h-12 px-8 text-lg border-b-4 border-orange-800 active:border-b-0 hover:bg-orange-500"
        >
          {isPending ? "Uploading..." : "Upload"}
        </Button>
      )}
    </div>

    {/* DRAG & DROP ZONE */}
    <div className="w-full max-w-3xl">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full min-h-[250px] md:min-h-[350px] border-2 border-dashed border-gray-400
                   flex items-center justify-center rounded-lg p-4"
      >
        {!file ? (
          <p className="text-gray-300 text-center text-lg">
            Drag & drop a JSON file here
          </p>
        ) : (
          <div className="scrollbar-none w-full h-[50vh] bg-gray-800 rounded-lg overflow-auto p-4 text-sm">
            <pre>{JSON.stringify(previewData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  </div>
);

}

export default Page;
