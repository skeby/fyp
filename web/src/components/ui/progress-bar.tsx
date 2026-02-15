// components/ProgressBar.tsx
import React from "react";
import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  max?: number;
  type?: "continuous" | "discrete";
  label?:
    | boolean
    | { render: (value: number) => string; position?: "left" | "right" };
  containerClassName?: string;
  variant: "success" | "danger";
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  type = "continuous",
  label = true,
  containerClassName,
  variant,
}) => {
  const percentage = type === "discrete" ? (value / max) * 100 : value;

  const renderLabel = () => {
    if (typeof label === "object" && label.render) {
      return label.render(value);
    } else if (label === true) {
      return type === "discrete"
        ? `Step ${value} of ${max}`
        : `${Math.round(percentage)}%`;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "flex w-fit items-center gap-x-2",
        (typeof label === "object" && label.position === "left") ||
          (typeof label === "boolean" && label === true)
          ? "flex-row"
          : "flex-row-reverse",
        containerClassName,
      )}
    >
      {label && (
        <div className="text-primary flex-nowrap text-sm font-medium text-nowrap">
          {renderLabel()}
        </div>
      )}
      <div className="bg-secondary h-1.5 w-full max-w-30 min-w-30 flex-nowrap overflow-hidden rounded-lg">
        <div
          className={cn(
            "bg-foreground h-full rounded-lg transition-all duration-400",
            percentage >= 100
              ? variant === "success"
                ? "bg-green-500"
                : variant === "danger"
                  ? "bg-red-500"
                  : ""
              : "",
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
