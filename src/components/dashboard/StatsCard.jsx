import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const colorClasses = {
  info:    { light: "bg-[var(--color-info)]/10",    text: "text-[var(--color-info)]" },
  success: { light: "bg-[var(--color-success)]/10", text: "text-[var(--color-success)]" },
  warning: { light: "bg-[var(--color-warning)]/10", text: "text-[var(--color-warning)]" },
  accent:  { light: "bg-[var(--color-accent)]/10",  text: "text-[var(--color-accent)]" },
  danger:  { light: "bg-[var(--color-danger)]/10",  text: "text-[var(--color-danger)]" },
};

export default function StatsCard({ title, value, icon: Icon, color, trend, isLoading }) {
  const colors = colorClasses[color] || colorClasses.info;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="bg-[var(--color-surface)]/70 backdrop-blur border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-muted)] mb-2">{title}</p>
              {isLoading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold text-[var(--color-foreground)]">{value}</p>}
            </div>
            {Icon && <div className={`p-3 rounded-xl ${colors.light} group-hover:scale-110 transition-transform duration-300`}><Icon className={`w-6 h-6 ${colors.text}`} /></div>}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? <Skeleton className="h-4 w-32" /> : <p className="text-sm text-[var(--color-muted)]">{trend}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}