import { cn } from "@/lib/utils";

const Spinner = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn(
        "text-primary data-[state=open]:text-primary size-5 animate-spin",
        className,
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        stroke-linecap="round"
        className="text-primary opacity-75"
        stroke-width="4"
        stroke="currentColor"
        d="M 22 12 A 10 10 0 0 1 5 19"
      ></path>
    </svg>
  );
};

export default Spinner;
