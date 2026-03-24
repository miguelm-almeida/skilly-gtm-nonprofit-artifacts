"use client";

import { cn } from "@/lib/utils";
import { GraduationCap, Users, Home, Shield } from "lucide-react";
import type { CategoryConfig } from "@/lib/types";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "mutual-membership-benefit": Shield,
  education: GraduationCap,
  "human-services": Users,
  "housing-shelter": Home,
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "mutual-membership-benefit": "VEBA trusts and mutual benefit organizations (NTEE 9)",
  education: "Universities, schools, and educational institutions (NTEE 2)",
  "human-services": "Social services, community organizations (NTEE 5)",
  "housing-shelter": "Housing development and shelter programs (NTEE 5, prefix L)",
};

interface CategoryCardProps {
  config: CategoryConfig;
  onClick: () => void;
  isLoading?: boolean;
}

export function CategoryCard({ config, onClick, isLoading }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[config.slug] || Users;
  const description = CATEGORY_DESCRIPTIONS[config.slug] || "";

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "group relative w-full text-left rounded-md border p-6 transition-all duration-200",
        "bg-white hover:shadow-[0_1px_8px_rgba(31,28,38,0.08)] hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5848F7]",
        isLoading && "opacity-60 cursor-wait",
        !isLoading && "border-[#E9E9EA] hover:border-[#5848F7]/40",
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors",
          "bg-[#F7F7F8] text-[#636168] group-hover:bg-[#F1F1FE] group-hover:text-[#5848F7]",
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#1F1C26] text-[15px] leading-tight" style={{ letterSpacing: "-0.01em" }}>
            {config.label}
          </h3>
          <p className="mt-1.5 text-sm text-[#77757B] leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
