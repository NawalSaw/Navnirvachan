"use client";

import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/Button";
import { Delete, Plus } from "lucide-react";

function DynamicInput({
  onChange,
}:{
  onChange: (areas: string[]) => void;
}) {
  const [inputs, setInputs] = React.useState<{ id: number; value: string }[]>([{
    id: Date.now(),
    value: ""
  }]);
  onChange(inputs.map((input) => input.value));
  const addInput = () => {
    setInputs([...inputs, { id: Date.now(), value: "" }]); // Unique ID for each input
  };

  const removeInput = (id: number) => {
    if(inputs.length === 1){
      alert("Atleast one area is required")
      return
    }
    setInputs(inputs.filter((input) => input.id !== id));
  };

  return (
    <div className="flex flex-row items-end gap-4 justify-center w-[113%]">
      <div
        className="flex gap-4 max-h-36 overflow-y-scroll scrollbar-none flex-col w-full"
        ref={(el) => el?.scrollTo({ top: el.scrollHeight })}
      >
        {inputs.map(({ id, value }, index) => (
          <div
            key={id}
            className="flex items-center gap-2 w-full border-2 border-orange-400 rounded-lg p-2"
          >
            <Input
              className="border-none focus-visible:ring-0 flex-1 focus:ring-0 focus:outline-none"
              placeholder={`Area ${index + 1}`}
              value={value}
              onChange={(e) =>
                setInputs((prev) =>
                  prev.map((input) =>
                    input.id === id ? { ...input, value: e.target.value } : input
                  )
                )
              }
            />
            <Delete
              size={25}
              onClick={() => removeInput(id)}
              className="cursor-pointer text-gray-500 hover:text-red-500"
            />
          </div>
        ))}
      </div>
      <Button
        className="bg-amber-500 px-4 py-2 hover:bg-amber-600 border-b-4 border-amber-700 active:border-b-0 transition-all duration-100"
        onClick={addInput}
      >
        <Plus size={20} />
      </Button>
    </div>
  );
}

export default DynamicInput;
