"use client"

import { Plus } from "lucide-react"
import { useRef, useState } from "react";

function FileUpload({ onUpload }: { onUpload: (image: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file)); // For UI preview only
      onUpload(file); // ✅ send File object, not URL
    } else {
      alert("Please select a valid image file.");
    }
  };

  return (
    <div
      onClick={() => imgRef.current?.click()}
      className="flex items-center overflow-hidden justify-center rounded-full w-40 h-40 bg-gray-600 border border-dashed cursor-pointer"
    >
      <input
        ref={imgRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
      {!preview && <Plus size={60} />}
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-cover rounded"
        />
      )}
    </div>
  );
}

export default FileUpload;
