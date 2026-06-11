"use client";
import { useEffect, useState } from "react";
import React from "react";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Send,
  Truck,
  BadgeCheck,
  Shield,
  Navigation,
  X,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { Card, CardContent } from "@/components/ui/card";
import { fetchMapillaryImage, OverpassPharmacy } from "./overpassPharmacies";
import { PharmacistType, PharmacyWithDistance } from "../../../interface";
import Link from "next/link";
import { cn } from "../utility/setup";
// import { usePharmacyStore } from "@/stores/index";


const statusLabel: Record<string, string> = { online: "ออนไลน์", busy: "ยุ่ง", offline: "ออฟไลน์" };
const statusVariant: Record<string, "success" | "warning" | "muted"> = { online: "success", busy: "warning", offline: "muted" };
const statusDot: Record<string, "online" | "busy" | "offline"> = { online: "online", busy: "busy", offline: "offline" };

interface Props {
  pharmacyId: string | null;
  osmPharmacy?: OverpassPharmacy | null;
  onClose: () => void;
  pharmacists:PharmacistType[]
  pharmacies:PharmacyWithDistance[]
}

export default function PharmacyDetailPanel({ pharmacyId, osmPharmacy, onClose ,pharmacies,pharmacists}: Props) {
  const allPharmacies = pharmacies
  const allPharmacists = pharmacists

  // Cover image from Mapillary — fetched at component level (Rules of Hooks)
  const [coverImg, setCoverImg] = useState<string | null>(null);
  useEffect(() => {
    if (!osmPharmacy) { setCoverImg(null); return; }
    let cancelled = false;
    fetchMapillaryImage(osmPharmacy.lat, osmPharmacy.lng).then((url) => {
      if (!cancelled) setCoverImg(url);
    });
    return () => { cancelled = true; };
  }, [osmPharmacy?.lat, osmPharmacy?.lng]); 

  // Close on Escape key
  useEffect(() => {
    if (!pharmacyId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pharmacyId, onClose]);

  const isOpen = !!pharmacyId;

  // OSM pharmacy panel
  const renderOSM = (p: OverpassPharmacy) => {
    // Find pharmacists whose workplace matches this pharmacy name (case-insensitive partial match)
    const normalizedName = p.name.toLowerCase().trim();
    const matchedPharmacists = allPharmacists.filter((ph) => {
      const workplace = ph.workplace?.toLowerCase().trim() || '';
      return workplace && (normalizedName.includes(workplace) || workplace.includes(normalizedName));
    });
    // Fall back to showing online pharmacists if no workplace match
    const displayPharmacists = matchedPharmacists.length > 0
      ? matchedPharmacists
      : allPharmacists.filter((ph) => ph.availability === 'online').slice(0, 3);

    return (
    <div className="p-5 space-y-5">
      {/* Cover image */}
      <div className="h-36 rounded-2xl relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        {coverImg ? (
          <img src={coverImg} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <MapPin className="h-12 w-12 text-primary/25" />
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 text-white text-[10px] font-semibold">
          <BadgeCheck className="h-3 w-3" /> {coverImg ? "Mapillary" : "OpenStreetMap"}
        </div>
      </div>

      {/* Name */}
      <div>
        <h2 className="font-bold text-lg leading-tight mb-1">{p.name}</h2>
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <Shield className="h-3.5 w-3.5" />
          หมุดข้อมูลจริงจาก OSM
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>{p.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary shrink-0" />
          <span>{p.distance.toFixed(1)} กม. จากตำแหน่งกลางกรุงเทพ</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary shrink-0" />
          {p.phone ? <a href={`tel:${p.phone}`} className="hover:text-primary font-medium">{p.phone}</a> : <span>ไม่มีข้อมูลเบอร์โทร</span>}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <span>{p.openingHoursText ?? "ไม่มีข้อมูลเวลาเปิด"}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "ประเภท", value: "ร้านยา" },
          { label: "OSM ID", value: `${p.osmType}/${p.osmId}` },
          { label: "พิกัด", value: `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border/40 bg-muted/40 p-3">
            <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
            <p className="font-bold text-xs truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2">
        <Button className="h-10 rounded-xl gap-2 w-full" asChild>
          <Link href={`/handoff?pharmacyId=${encodeURIComponent(p._id)}`}>
            <Send className="h-4 w-4" /> ส่งข้อมูลให้ร้านนี้
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1.5 text-xs" asChild>
            <a href={p.osmUrl} target="_blank" rel="noreferrer">
              <Navigation className="h-3.5 w-3.5" /> OSM
            </a>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1.5 text-xs" asChild>
            <a href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`} target="_blank" rel="noreferrer">
              <MapPin className="h-3.5 w-3.5" /> Google Maps
            </a>
          </Button>
        </div>
      </div>

      {/* Associated pharmacists */}
      {displayPharmacists.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-1">
            {matchedPharmacists.length > 0 ? 'เภสัชกรประจำร้าน' : 'เภสัชกรพร้อมให้บริการ'}
          </h3>
          <p className="text-[11px] text-muted-foreground mb-3">
            {matchedPharmacists.length > 0
              ? `พบ ${matchedPharmacists.length} คนที่ทำงานที่ร้านนี้`
              : 'เภสัชกรที่พร้อมให้คำปรึกษาออนไลน์ผ่าน MediBridge'}
          </p>
          <div className="space-y-2">
            {displayPharmacists.map((ph) => (
              <Card key={ph._id} className="border-border/40">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {/* <Avatar src={ph.avatar || undefined} name={ph.name} size="md" className="ring-2 ring-background shadow-sm" /> */}
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                        ph.availability === "online" ? "bg-success" : ph.availability === "busy" ? "bg-warning" : "bg-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs mb-0.5">{ph.name}</p>
                      <div className="flex items-center gap-1 mb-1">
                        <BadgeCheck className="h-2.5 w-2.5 text-primary shrink-0" />
                        <span className="text-[10px] text-primary font-semibold">เภสัชเลขที่ {ph.licenseNo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant[ph.availability]} dot={statusDot[ph.availability]} className="text-[10px] px-1.5 py-0">
                          {statusLabel[ph.availability]}
                        </Badge>
                        <div className="flex items-center gap-0.5">
                          <Rating value={ph.rating} size="sm" />
                          <span className="text-[10px] text-muted-foreground">({ph.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/consult?pharmacistId=${encodeURIComponent(ph._id)}`}>
                      <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 rounded-lg shrink-0">
                        ปรึกษา
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  };

  // Supabase pharmacy panel
  const renderDB = () => {
    const pharmacy = allPharmacies.find((p) => p._id === pharmacyId) ?? allPharmacies[0];
    if (!pharmacy) return null;
    const pharmacists = allPharmacists.filter((p) => p.pharmacyId === pharmacy._id);
    const coverImg = pharmacy.imageUrl || null;
    const onlineCount = pharmacists.filter((p) => p.availability === "online").length;

    return (
      <div className="space-y-0">
        {/* Cover */}
        <div className="h-40 relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
          {coverImg
            ? <img src={coverImg} alt={pharmacy.name} className="w-full h-full object-cover" />
            : <div className="absolute inset-0 flex items-center justify-center"><MapPin className="h-14 w-14 text-primary/20" /></div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
            {pharmacy.verificationStatus === "verified" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/90 text-white text-[10px] font-semibold">
                <BadgeCheck className="h-3 w-3" /> ร้านยืนยันแล้ว
              </div>
            )}
            {pharmacy.hasDelivery && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 text-white text-[10px] font-semibold">
                <Truck className="h-3 w-3" /> มีจัดส่ง
              </div>
            )}
          </div>
          {onlineCount > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 border border-border/40 text-[10px] font-semibold">
              <span className="h-2 w-2 rounded-full bg-success" /> เภสัชกรออนไลน์ {onlineCount} คน
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Name */}
          <div>
            <h2 className="font-bold text-lg leading-tight mb-1">{pharmacy.name}</h2>
            {pharmacy.verificationStatus === "verified" && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <Shield className="h-3.5 w-3.5" /> ร้านยาได้รับการตรวจสอบและรับรองจาก MediBridge
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-2 text-sm text-muted-foreground pb-4 border-b border-border/40">
            <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>{pharmacy.address}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary shrink-0" /><a href={`tel:${pharmacy.phone}`} className="hover:text-primary font-medium">{pharmacy.phone}</a></div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary shrink-0" /><span>เปิดทุกวัน <strong className="text-foreground">08:00 – 22:00</strong></span></div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-black text-warning tabular-nums">{pharmacy.rating}</p>
              <div className="flex gap-0.5 justify-center mt-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={cn("h-3 w-3", s <= Math.round(pharmacy.rating) ? "fill-warning text-warning" : "text-border")} />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{pharmacy.reviewCount} รีวิว</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5,4,3].map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-3">{n}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-warning" style={{ width: n===5?"72%":n===4?"20%":"8%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service tags */}
          <div className="flex flex-wrap gap-1.5">
            {pharmacy.services.map((s) => (
              <span key={s} className="text-[10px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40">{s}</span>
            ))}
          </div>

          {/* CTA */}
          <Button className="w-full h-10 rounded-xl gap-2" asChild>
            <Link href="/handoff"><Send className="h-4 w-4" />ส่งข้อมูลให้ร้านนี้</Link>
          </Button>

          {/* Pharmacists */}
          {pharmacists.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-3">เภสัชกรประจำร้าน</h3>
              <div className="space-y-2">
                {pharmacists.map((ph) => (
                  <Card key={ph._id} className="border-border/40">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {/* <Avatar src={ph.avatar || undefined} name={ph.name} size="md" className="ring-2 ring-background shadow-sm" /> */}
                          <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background", ph.availability==="online"?"bg-success":ph.availability==="busy"?"bg-warning":"bg-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs mb-0.5">{ph.name}</p>
                          <div className="flex items-center gap-1 mb-1">
                            <BadgeCheck className="h-2.5 w-2.5 text-primary" />
                            <span className="text-[10px] text-primary font-semibold">เภสัชเลขที่ {ph.licenseNo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusVariant[ph.availability]} dot={statusDot[ph.availability]} className="text-[10px] px-1.5 py-0">{statusLabel[ph.availability]}</Badge>
                            <div className="flex items-center gap-0.5">
                              <Rating value={ph.rating} size="sm" />
                              <span className="text-[10px] text-muted-foreground">({ph.reviewCount})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Reviews placeholder — no reviews table yet */}
          <div className="rounded-xl border border-border/40 bg-muted/30 p-4 flex flex-col items-center gap-2 text-center">
            <MessageCircle className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-xs font-semibold text-muted-foreground">ยังไม่มีรีวิว</p>
            <p className="text-[11px] text-muted-foreground/70">เป็นคนแรกที่รีวิวร้านยานี้!</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute top-0 right-0 h-full z-40",
          "w-full md:w-[380px]",
          "bg-background border-l border-border/40 shadow-2xl",
          "flex flex-col overflow-hidden",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
          <span className="font-semibold text-sm">ข้อมูลร้านยา</span>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {pharmacyId && (
            osmPharmacy
              ? renderOSM(osmPharmacy)
              : renderDB()
          )}
        </div>
      </div>
    </>
  );
}
