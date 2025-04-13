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
    <Card className={`p-4 rounded-2xl flex items-center h-32 shadow-md ${bgColor || "bg-pink-100"}`}>
      <CardContent className="flex justify-center items-center h-full gap-4">
        {icon || <Users className="text-blue-500" size={40} />}
        <div>
          <h2 className="text-4xl font-bold">{value}</h2>
          <p className="text-gray-600 text-lg">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
