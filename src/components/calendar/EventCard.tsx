import { Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type EventCardProps = {
  title: string;
  time: string;
  unitName: string;
  location: string;
  description: string;
  onClick: () => void;
};

export function EventCard({
  title,
  time,
  unitName,
  location,
  description,
  onClick,
}: EventCardProps) {
  return (
    <Card
      className="cursor-pointer rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <Badge variant="secondary">{time}</Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {unitName}
          </span>

          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {location}
          </span>
        </div>

        <p className="text-sm leading-6 text-slate-700">{description}</p>
      </CardContent>
    </Card>
  );
}