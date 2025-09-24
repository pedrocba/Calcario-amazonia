import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const colorClasses = {
  primary: { 
    bg: "bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5", 
    text: "text-[var(--color-primary)]",
    icon: "text-[var(--color-primary)]"
  },
  success: { 
    bg: "bg-gradient-to-br from-[var(--color-success)]/10 to-[var(--color-success)]/5", 
    text: "text-[var(--color-success)]",
    icon: "text-[var(--color-success)]"
  },
  warning: { 
    bg: "bg-gradient-to-br from-[var(--color-warning)]/10 to-[var(--color-warning)]/5", 
    text: "text-[var(--color-warning)]",
    icon: "text-[var(--color-warning)]"
  },
  info: { 
    bg: "bg-gradient-to-br from-[var(--color-info)]/10 to-[var(--color-info)]/5", 
    text: "text-[var(--color-info)]",
    icon: "text-[var(--color-info)]"
  },
  danger: { 
    bg: "bg-gradient-to-br from-[var(--color-danger)]/10 to-[var(--color-danger)]/5", 
    text: "text-[var(--color-danger)]",
    icon: "text-[var(--color-danger)]"
  },
};

export default function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  color = "primary", 
  trend, 
  isLoading,
  trendDirection = "up" 
}) {
  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="bg-[var(--color-surface)]/80 backdrop-blur border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-current"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-current"></div>
        </div>
        
        <CardContent className="p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-muted)] mb-2 uppercase tracking-wider">
                {title}
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-2xl font-bold text-[var(--color-foreground)] mb-1">
                  {value}
                </p>
              )}
            </div>
            {Icon && (
              <div className={`p-3 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
            )}
          </div>

          {trend && (
            <div className="flex items-center gap-2">
              {trendDirection === "up" ? (
                <TrendingUp className={`w-4 h-4 ${colors.text}`} />
              ) : (
                <TrendingDown className={`w-4 h-4 ${colors.text}`} />
              )}
              <p className={`text-sm font-medium ${colors.text}`}>
                {trend}
              </p>
            </div>
          )}
          
          {isLoading && !trend && (
            <Skeleton className="h-4 w-24 mt-2" />
          )}
        </CardContent>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Card>
    </motion.div>
  );
}