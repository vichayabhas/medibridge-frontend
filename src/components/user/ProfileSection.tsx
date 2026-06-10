"use client";
import { toast } from "sonner";
import {
  User,
  ChevronRight,
  Settings,
  LogOut,
  MapPin,
  // RefreshCw,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Id } from "../../../configTypes";
import { Input } from "../ui/input";
import { setTextToString } from "../utility/setup";
import { UpdateProfile } from "../../../interface";

interface ProfileSectionProps {
  currentUser: {
    _id: Id;
    name: string;
    email: string;
    phone: string;
    role: string;
    createAt?: string;
    avatar_url?: string;
  };
  // syncStatus: "synced" | "syncing" | "error";
  autoSyncClipboard: boolean;
  setAutoSyncClipboard: (v: boolean) => void;
  liveProfile: {
    _id: Id;
    name: string;
    email: string;
    phone?: string;
    role: string;
    createAt?: string;
  } | null;
  logout: () => Promise<void>;
  // onSyncClick: () => void;
  handleUpdate:React.Dispatch<UpdateProfile>
}

export function ProfileSection({
  currentUser,
  // syncStatus,
  autoSyncClipboard,
  setAutoSyncClipboard,
  liveProfile,
  logout,
  handleUpdate
  // onSyncClick,
}: ProfileSectionProps) {
  const navigate = useRouter();
  const [name, setName] = React.useState(currentUser.name);
  const [email, setEmail] = React.useState(currentUser.email);
  const [phone, setPhone] = React.useState(currentUser.phone);

  return (
    <>
      {/* Personal info */}
      <Card className="mb-6 border-border/50">
        <CardContent className="p-5">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            ข้อมูลบัญชี
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground">ชื่อ-นามสกุล</span>
              <span className="font-medium">
                <Input value={name} onChange={setTextToString(setName, true)} />
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground">อีเมล</span>
              <span className="font-medium">
                <Input
                  value={email}
                  onChange={setTextToString(setEmail, true)}
                />
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">เบอร์โทร</span>
              <span className="font-medium">
                <Input
                  value={phone}
                  onChange={setTextToString(setPhone, true)}
                />
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-border/40">
              <span className="text-muted-foreground">บทบาท</span>
              <Badge
                variant={
                  currentUser.role === "pharmacist" ? "success" : "muted"
                }
                className="text-xs"
              >
                {currentUser.role === "pharmacist" ? "เภสัชกร" : "ผู้ใช้ทั่วไป"}
              </Badge>
            </div>
          </div>
          {/* Sync Status */}
          <div className="flex items-center justify-between mt-3 px-1">
            {/* <div className="flex items-center gap-2"> */}
            {/* <div
                className={`h-2 w-2 rounded-full ${
                  syncStatus === "synced" ? "bg-green-500" : syncStatus === "syncing" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {syncStatus === "synced" ? " synced" : syncStatus === "syncing" ? " syncing..." : " error"}
              </span>
            </div> */}
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncClipboard}
                onChange={(e) => setAutoSyncClipboard(e.target.checked)}
                className="rounded border-gray-300"
              />
              Auto-sync to clipboard
            </label>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify(liveProfile, null, 2),
                );
                toast.success("คัดลอกข้อมูลแล้ว");
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              คัดลอกข้อมูล
            </Button>
            {/* <Button
              variant="outline"
              className="flex-1 rounded-xl"
              size="sm"
              onClick={onSyncClick}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              ซิงค์ข้อมูล
            </Button> */}
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl mt-2"
            size="sm"
            onClick={()=>{
              handleUpdate({name,email,phone})
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            แก้ไขข้อมูล
          </Button>
        </CardContent>
      </Card>

      {/* Nearby pharmacies shortcut */}
      <Card className="border-border/50 hover:border-primary/30 transition-colors mb-6">
        <CardContent className="p-4">
          <Link href="/nearby" className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">ค้นหาร้านยาใกล้เคียง</p>
              <p className="text-xs text-muted-foreground">
                ดูร้านยาและเภสัชกรพร้อมให้บริการ
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </Link>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-destructive/20">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 rounded-xl gap-2"
            onClick={async () => {
              await logout();
              navigate.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
