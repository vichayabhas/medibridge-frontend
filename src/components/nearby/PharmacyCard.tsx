"use client";
import { BadgeCheck, ChevronRight, Clock, MapPin, Navigation, Phone } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { cn } from "../utility/setup";
import { fetchMapillaryImage, OverpassPharmacy } from "./overpassPharmacies";
function formatDistance(distance: number) {
  return distance < 1 ? `${(distance * 1000).toFixed(0)} ม.` : `${distance.toFixed(1)} กม.`;
}

function useMapillaryImage(lat: number, lng: number) {
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    fetchMapillaryImage(lat, lng).then((url) => {
      if (!cancelled) setImgUrl(url);
    });
    return () => { cancelled = true; };
  }, [lat, lng]);
  return imgUrl;
}

export default function PharmacyCard({
  p,
  selected,
  onSelect,
  onOpenPanel,
}: {
  p: OverpassPharmacy;
  selected: boolean;
  onSelect: () => void;
  onOpenPanel: () => void;
}) {
  const streetImg = useMapillaryImage(p.lat, p.lng);

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card overflow-hidden transition-all duration-300",
        selected
          ? "border-primary/50 shadow-[var(--shadow-elevated)] ring-1 ring-primary/20"
          : "border-border/45 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
      )}
    >
      {/* Street-view thumbnail */}
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-primary/15 to-secondary/15">
          {streetImg ? (
            <img src={streetImg} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary/30" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              p.isOpen ? "bg-success text-white" : "bg-black/50 text-white/80"
            )}>
              {p.isOpen ? "เปิดอยู่" : "ไม่ทราบ"}
            </span>
          </div>
          <div className="absolute bottom-2 left-2">
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-black/40 text-white/80">
              {streetImg ? "Mapillary" : "OpenStreetMap"}
            </span>
          </div>
        </div>

        <div className="p-4 pb-2">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <h3 className="font-bold text-sm leading-snug text-foreground">{p.name}</h3>
                <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1">
                <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                {p.address}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Navigation className="h-3 w-3 text-primary" />
                <span className="text-sm font-bold text-primary tabular-nums">
                  {formatDistance(p.distance)}
                </span>
              </div>
            </div>
          </div>

          {p.openingHoursText && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="line-clamp-1">{p.openingHoursText}</span>
            </div>
          )}
        </div>
      </button>

      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{p.openingHoursText ? "มีข้อมูลเวลาเปิด" : "ไม่มีข้อมูลเวลาเปิด"}</span>
        </div>
        <div className="flex items-center gap-2">
          {p.phone && (
            <a
              href={`tel:${p.phone}`}
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-muted border border-border/40 hover:bg-muted/80 transition-colors"
              title="โทร"
            >
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          )}
          <Button size="sm" variant="default" className="h-8 text-xs rounded-xl gap-1.5 px-3" onClick={onOpenPanel}>
            ดูหน้าร้าน
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </article>
  );
}