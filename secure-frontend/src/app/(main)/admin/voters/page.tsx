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
    <div className="bg-gray-700 flex flex-col gap-10 items-center justify-center text-white h-[90vh] mt-20 w-[105vh] mx-10 p-10">
      <span className="space-y-3 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-center">Upload Voter</h1>
        <p>Upload the voter list data in the JSON format</p>
        {file && (
          <Button
            onClick={handleUpload}
            className="bg-orange-400 rounded-full mt-6 h-14 px-10 py-5 text-xl border-b-4 border-orange-800 active:border-b-0 hover:bg-orange-500"
          >
            {isPending ? "Uploading..." : "Upload"}
          </Button>
        )}
      </span>
      <div className="p-4 w-full h-full max-h-[60vh]">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-[90%] h-full border-2 border-dashed border-gray-400 flex justify-center text-xl items-center text-gray-400 rounded-lg p-4"
        >
          {!file ? (
            <p>Drag and drop a JSON file here</p>
          ) : (
            <div className="scrollbar-none w-full h-full rounded bg-gray-600 text-sm text-white overflow-auto">
              <pre>{JSON.stringify(previewData, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
