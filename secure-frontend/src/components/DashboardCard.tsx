import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface StatCardProps {
  icon?: React.ReactNode;
  value: string | number;
  label: string;
  bgColor?: string;
}

const DashboardCard: React.FC<StatCardProps> = ({ icon, value, label, bgColor }) => {
  return (
    <Card
      className={`rounded-2xl shadow-md ${bgColor || "bg-pink-100"} 
      p-4 sm:p-5 
      flex flex-col sm:flex-row 
      items-center sm:items-start 
      justify-center sm:justify-between 
      gap-3 sm:gap-4 
      h-auto sm:h-32`}
    >
      <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-0">
        {/* ICON */}
        <div className="flex justify-center items-center">
          {icon || <Users className="text-blue-500" size={36} />}
        </div>

        {/* VALUE + LABEL */}
        <div className="text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold">{value}</h2>
          <p className="text-gray-600 text-base sm:text-lg">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
