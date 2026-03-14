import { Button } from "@/components/ui/button";

type DayButtonProps = {
  day: number;
  enabled: boolean;
  onClick: () => void;
};

export function DayButton({ day, enabled, onClick }: DayButtonProps) {
  return (
    <Button
      variant={enabled ? "default" : "outline"}
      disabled={!enabled}
      onClick={onClick}
      className="h-14 rounded-2xl text-base"
    >
      {day}
    </Button>
  );
}