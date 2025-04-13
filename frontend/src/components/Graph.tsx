import { format, parseISO, subDays, isAfter } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export interface GraphProps {
  data: any[];
}

function processData(rawData: any[]) {
  const counts: Record<string, number> = {};

  const today = new Date();
  const sevenDaysAgo = subDays(today, 6); // Include today, so 7 total days

  rawData.forEach((item) => {
    const voteDate = parseISO(item.date);
    if (isAfter(voteDate, sevenDaysAgo) || format(voteDate, "yyyy-MM-dd") === format(sevenDaysAgo, "yyyy-MM-dd")) {
      const dateStr = format(voteDate, "yyyy-MM-dd");
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    }
  });

  // Fill in empty days with 0 votes to keep the graph continuous
  const finalData = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, "yyyy-MM-dd");
    finalData.push({ date: dateStr, votes: counts[dateStr] || 0 });
  }

  return finalData;
}

function Graph({ data }: GraphProps) {
  const processedData = processData(data);

  return (
    <ResponsiveContainer width="95%" height="100%">
      <LineChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <XAxis dataKey="date" />
        <YAxis />
        <Legend />
        <Line
          type="monotone"
          dataKey="votes"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default Graph;
