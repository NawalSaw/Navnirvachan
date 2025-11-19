"use client"

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Type for your candidate
interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  location: string;
  image: string;
  votes: number;
}

interface Props {
  candidates: Candidate[];
}

const ResultGraph: React.FC<Props> = ({ candidates }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={candidates} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="votes" fill="#4e73df" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResultGraph;
