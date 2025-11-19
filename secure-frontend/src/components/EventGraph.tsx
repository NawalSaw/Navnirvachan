"use client"

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Define the type of each log entry
interface ClientDetails {
  createdAt: string;
  updatedAt: string;
}

interface LogEntry {
  _id: string;
  event: string;
  location: string;
  date: string;
  description: string;
  ClientDetails: ClientDetails;
}

interface Props {
  logs: LogEntry[];
}

interface ChartData {
  state: string;
  count: number;
}

const EventGraph = ({ logs }: {logs: LogEntry[]}) => {
  console.log(logs)
  const stateCounts: Record<string, number> = {};
  logs.map((log) => {
    const locationParts = log.location.split(",").map((part) => part.trim());
    const state = locationParts.length >= 2 ? locationParts[1] : "Unknown";

    stateCounts[state] = (stateCounts[state] || 0) + 1;
  });

  const chartData: ChartData[] = Object.entries(stateCounts).map(
    ([state, count]) => ({
      state,
      count,
    })
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="state" />
        <YAxis allowDecimals={false} />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EventGraph;
