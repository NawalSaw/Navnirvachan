import { format, subDays, isAfter } from "date-fns";
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
  const sevenDaysAgo = subDays(today, 6);

  rawData.forEach((item) => {
    const voteDate = new Date(item.publishedAt);

    if (
      isAfter(voteDate, sevenDaysAgo) ||
      format(voteDate, "yyyy-MM-dd") === format(sevenDaysAgo, "yyyy-MM-dd")
    ) {
      const dateStr = format(voteDate, "yyyy-MM-dd");
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    }
  });

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
    <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[38rem] p-2 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />

          <Tooltip />

          {/* Date formatter for responsiveness */}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => format(new Date(value), "MM/dd")}
          />

          <YAxis tick={{ fontSize: 10 }} />

          <Legend wrapperStyle={{ fontSize: "12px" }} />

          <Line
            type="monotone"
            dataKey="votes"
            stroke="#8884d8"
            strokeWidth={3}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Graph;
