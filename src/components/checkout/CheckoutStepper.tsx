import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Voucher", "Data Diri", "Pembayaran", "Selesai"];

export default function CheckoutStepper({ current }: { current: number }) {
  return (
    <div className="w-full">
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < current;
          const isActive = stepNum === current;
          return (
            <li key={label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors",
                    isDone && "bg-primary border-primary text-primary-foreground",
                    isActive && "border-primary text-primary bg-primary/10",
                    !isDone && !isActive && "border-border text-muted-foreground bg-card"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : stepNum}
                </div>
                <span
                  className={cn(
                    "mt-2 text-[10px] sm:text-xs uppercase tracking-wider font-medium text-center",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-2 -mt-5 transition-colors",
                    stepNum < current ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}