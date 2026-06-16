/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
// import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
// import { selectCurrentUser, useAuthStore } from "@/stores/auth";
import { Store, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { PharmacyDashboardData } from "../../interface";
import { setTextToFloat, setTextToString } from "./utility/setup";
import pharmacyRegister from "@/libs/user/pharmacyRegister";
import TypingImageSource from "./utility/TypingImageSource";
import PharmacistVerifiedDashboard from "./PharmacyVerifiedDashboard";

// interface Pharmacy {
//   id: string;
//   name: string;
//   address: string;
//   lat: number;
//   lng: number;
//   phone: string;
//   verification_status: "pending" | "verified" | "rejected";
// }

// interface Order {
//   id: string;
//   user_id: string;
//   status:
//     | "pending"
//     | "confirmed"
//     | "preparing"
//     | "ready"
//     | "delivering"
//     | "completed"
//     | "cancelled";
//   subtotal: number;
//   delivery_fee: number;
//   total: number;
//   otp_code: string;
//   estimated_time: string;
//   created_at: string;
// }
export default function PharmacyDashboard({
  data,
  token,
}: {
  data: PharmacyDashboardData;
  token: string;
}) {
  // const currentUser = useAuthStore(selectCurrentUser);
  const [pharmacy, setPharmacy] = useState(data.pharmacy);
  const [orders, setOrders] = useState(data.orders);
  // const [loading, setLoading] = useState(true);

  // Pharmacy creation form state
  const [regName, setRegName] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regLat, setRegLat] = useState(13.7563);
  const [regLng, setRegLng] = useState(100.5018);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  // const fetchPharmacyData = async () => {
  //   if (!currentUser) return;
  //   setLoading(true);
  //   try {
  //     // 1. Fetch managed pharmacy
  //     const { data: pharmData, error: pharmError } = await supabase
  //       .from("pharmacies")
  //       .select("*")
  //       .eq("manager_id", currentUser.id)
  //       .maybeSingle();

  //     if (pharmError) throw pharmError;

  //     if (pharmData) {
  //       setPharmacy(pharmData as Pharmacy);

  //       // 2. Fetch pickup orders if pharmacy is verified
  //       if (pharmData.verification_status === "verified") {
  //         const { data: ordersData, error: ordersError } = await supabase
  //           .from("orders")
  //           .select("*")
  //           .eq("pharmacy_id", pharmData.id)
  //           .eq("fulfillment", "pickup")
  //           .order("created_at", { ascending: false });

  //         if (ordersError) throw ordersError;
  //         setOrders((ordersData as Order[]) || []);
  //       }
  //     } else {
  //       setPharmacy(null);
  //     }
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   } catch (err: any) {
  //     toast.error("ดึงข้อมูลไม่สำเร็จ: " + err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchPharmacyData();
  // }, [currentUser]);

  const handleRegisterPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!currentUser) return;
    if (!regName || !regAddress || !regPhone || !imageUrl) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setSubmittingReg(true);
    try {
      const newPharmacy = await pharmacyRegister(
        {
          imageUrl,
          name: regName.trim(),
          lat: regLat,
          lng: regLng,
          phone: regPhone.trim(),
          address: regAddress.trim(),
        },
        token,
      );
      setPharmacy(newPharmacy);

      // if (error) throw error;

      toast.success("ส่งคำขอเปิดร้านขายยาเรียบร้อย กำลังรอ Admin อนุมัติ");
      // fetchPharmacyData();
    } catch (err: any) {
      toast.error("ส่งคำขอไม่สำเร็จ: " + err.message);
    } finally {
      setSubmittingReg(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 gap-3">
  //       <Loader2 className="h-10 w-10 animate-spin text-primary" />
  //       <p className="text-sm text-slate-400">กำลังโหลดระบบจัดยาหลังบ้าน...</p>
  //     </div>
  //   );
  // }

  // Case 1: Has not registered a pharmacy yet
  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 mt-14">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 text-primary">
              <Store className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              ลงทะเบียนร้านขายยา
            </h2>
            <p className="text-xs text-slate-500">
              กรอกข้อมูลร้านยาของคุณเพื่อขอเปิดสิทธิ์ดูแล Dashboard
            </p>
          </div>

          <form onSubmit={handleRegisterPharmacy} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">
                ชื่อร้านขายยา
              </label>
              <Input
                placeholder="เช่น ร้านยาฟาซิโน สามย่าน"
                value={regName}
                onChange={setTextToString(setRegName, true)}
                className="h-11 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">
                ที่ตั้งร้านขายยา
              </label>
              <Input
                placeholder="เช่น สามย่าน กรุงเทพมหานคร 10330"
                value={regAddress}
                onChange={setTextToString(setRegAddress, true)}
                className="h-11 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">
                เบอร์โทรติดต่อ
              </label>
              <Input
                placeholder="เช่น 02-611-0456"
                value={regPhone}
                onChange={setTextToString(setRegPhone, true)}
                className="h-11 rounded-xl text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">รูปภาพ</label>
              <TypingImageSource defaultSrc={null} onChange={setImageUrl} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Latitude
                </label>
                <Input
                  value={regLat.toString()}
                  onChange={setTextToFloat(setRegLat)}
                  className="h-11 rounded-xl text-xs"
                  required
                  type="number"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  Longitude
                </label>
                <Input
                  value={regLng.toString()}
                  onChange={setTextToFloat(setRegLng)}
                  className="h-11 rounded-xl text-xs"
                  required
                  type="number"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-xs font-bold gap-2 mt-2 shadow-md shadow-primary/20"
              disabled={submittingReg}
            >
              {submittingReg ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังลงทะเบียน...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  ส่งข้อมูลขออนุมัติเปิดร้าน
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <PharmacistVerifiedDashboard
      setOrders={setOrders}
      setPharmacy={setPharmacy}
      pharmacy={pharmacy}
      orders={orders}
      token={token}
    />
  );
  // const orderSocket = new SocketReady<OrderType[]>(
  //   socket,
  //   "update-order",
  //   pharmacy._id,
  // );

  // Case 2: Pharmacy request is pending or rejected

  // Case 3: Verified Pharmacy Dashboard!
}
