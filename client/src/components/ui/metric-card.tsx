import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subLabel: string;
  change: number;
  isPositive: boolean;
}

export function MetricCard({ label, value, subLabel, change, isPositive }: MetricCardProps) {
  const isChurnRate = label.includes('Churn');
  const shouldShowPositive = isChurnRate ? change < 0 : change > 0;
  
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">{label}</h3>
          <div className={`flex items-center text-xs font-medium ${
            shouldShowPositive 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {shouldShowPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change)}%
          </div>
        </div>
        
        <div className="mb-1">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        
        <div className="text-sm text-gray-500">{subLabel}</div>
      </CardContent>
    </Card>
  );
}