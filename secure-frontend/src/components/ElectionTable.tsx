import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPinned } from "lucide-react";

// Status color utility
const statusColors: Record<string, string> = {
  upcoming: "bg-blue-500",
  ongoing: "bg-green-500",
  completed: "bg-gray-500",
};

interface ElectionProps {
  _id: string;
  name: string;
  code: string;
  description: string;
  startDate: Date;
  endDate: Date;
  constituencies: string;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export default function ElectionCard({ data }: { data: ElectionProps }) {
  const formattedStart = new Date(data.startDate).toLocaleDateString();
  const formattedEnd = new Date(data.endDate).toLocaleDateString();

  return (
<div className="w-full max-w-md mx-auto p-2">
      <Card className="shadow-md hover:shadow-lg transition-shadow rounded-2xl border bg-orange-900 text-white w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">{data.name}</CardTitle>
            <Badge className={`${statusColors[data.status]} text-white`}>{data.status}</Badge>
          </div>
          <CardDescription className="text-sm text-orange-200">Code: {data.code}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-orange-200">{data.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <CalendarDays size={16} />
              <span>
                <strong>Start:</strong> {formattedStart}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDays size={16} />
              <span>
                <strong>End:</strong> {formattedEnd}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <MapPinned size={16} />
            <span>
              <strong>Constituencies:</strong> {data.constituencies}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
