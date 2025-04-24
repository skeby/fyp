import * as React from "react"

import { cn } from "@/lib/utils"
import { Eye, EyeClosed } from "lucide-react"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const [isTextVisible, setIsTextVisible] = React.useState(
      type !== "password"
    )
    return (
      <div className="relative">
        <input
          type={isTextVisible ? undefined : type}
          className={cn(
            "border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-11 w-full rounded-md border bg-transparent px-3 py-1 pr-10 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
        {type === "password" && (
          <span
            className="text-muted-foreground absolute top-1/2 right-3 z-50 -translate-y-1/2 cursor-pointer"
            onClick={() => setIsTextVisible((prev) => !prev)}
          >
            {isTextVisible ? (
              <EyeClosed className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
