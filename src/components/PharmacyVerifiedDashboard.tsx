"use client";
import React from "react";
import { OrderStatus, OrderType, PharmacyType } from "../../interface";
import { Button } from "./ui/button";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Package,
  Phone,
  Store,
  TrendingUp,
} from "lucide-react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { getBackendUrl, SocketReady } from "./utility/setup";
import updateOrderStatus from "@/libs/order/updateOrderStatus";
const socket = io(getBackendUrl());
export default async function PharmacistVerifiedDashboard({
  pharmacy,
  orders,
  setOrders,
  setPharmacy,
}: {
  pharmacy: PharmacyType;
  orders: OrderType[];
  setOrders: React.Dispatch<React.SetStateAction<OrderType[]>>;
  token: string;
  setPharmacy: React.Dispatch<React.SetStateAction<PharmacyType | null>>;
}) {
  const [verifyingOrder, setVerifyingOrder] = React.useState<OrderType | null>(
    null,
  );
  const [otpInput, setOtpInput] = React.useState("");
  const handleUpdateStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
  ) => {
    try {
      const newData=await updateOrderStatus(nextStatus,orderId)

      toast.success("อัปเดตสถานะออเดอร์เรียบร้อยแล้ว");
      orderSocket.trigger(newData)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("ไม่สามารถอัปเดตสถานะได้: " + err.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingOrder) return;

    if (otpInput.trim() !== verifyingOrder.otpCode) {
      toast.error("รหัสรับยาไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    try {
        const newData=await updateOrderStatus('completed',verifyingOrder._id)
      

      toast.success("ยืนยันรับยาเรียบร้อย ออเดอร์เสร็จสมบูรณ์");
      setVerifyingOrder(null);
      setOtpInput("");
      orderSocket.trigger(newData)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("ยืนยันไม่สำเร็จ: " + err.message);
    }
  };
  const pharmacySocket = new SocketReady<PharmacyType>(
    socket,
    "update-single-pharmacy",
    pharmacy._id,
  );
  const orderSocket = new SocketReady<OrderType[]>(
    socket,
    "update-order",
    pharmacy._id,
  );
  React.useEffect(() => {
    pharmacySocket.listen(setPharmacy);
    orderSocket.listen(setOrders);
    return () => {
      pharmacySocket.disconnect();
      orderSocket.disconnect();
    };
  });

  if (pharmacy.verificationStatus !== "verified") {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 mt-14">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 text-center space-y-4">
          <div
            className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-2 ${
              pharmacy.verificationStatus === "rejected"
                ? "bg-rose-50 text-rose-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {pharmacy.verificationStatus === "rejected" ? (
              <AlertTriangle className="h-8 w-8" />
            ) : (
              <Clock className="h-8 w-8" />
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {pharmacy.verificationStatus === "rejected"
              ? "คำขอถูกปฏิเสธ"
              : "กำลังรอการอนุมัติ"}
          </h2>
          <p className="text-xs text-slate-500 leading-[1.8] max-w-sm mx-auto">
            {pharmacy.verificationStatus === "rejected"
              ? "คำขอเปิดร้านของคุณไม่ได้รับการอนุมัติ กรุณาติดต่อผู้ดูแลระบบเพื่อแจ้งปัญหาเอกสาร"
              : `ร้านขายยา "${pharmacy.name}" ลงทะเบียนสำเร็จแล้ว ขณะนี้รอผู้ดูแลระบบตรวจสอบเอกสารสิทธิ์การเข้าถึง Dashboard`}
          </p>
          <div className="pt-2">
            {/* <Button
              variant="outline"
              className="rounded-xl h-10 px-6 text-xs gap-2"
              onClick={fetchPharmacyData}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              อัปเดตสถานะ
            </Button> */}
          </div>
        </div>
      </div>
    );
  }
  const todayPickups = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  );
  const completedPickups = orders.filter((o) => o.status === "completed");

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 mt-14">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6 border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-primary/10 rounded-2xl text-primary">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {pharmacy.name}
                </h1>
                <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  อนุมัติแล้ว
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {pharmacy.address}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {pharmacy.phone}
                </span>
              </p>
            </div>
          </div>
          {/* <Button
            variant="outline"
            className="self-start md:self-auto gap-2 rounded-xl text-xs"
            onClick={fetchPharmacyData}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            รีเฟรชออเดอร์
          </Button> */}
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                รอนัดหมายรับยา
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {todayPickups.length} รายการ
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                รับยาสำเร็จแล้ว
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {completedPickups.length} รายการ
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                ยอดจำหน่ายรวม
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                ฿
                {orders
                  .reduce(
                    (sum, o) => sum + (o.status === "completed" ? o.total : 0),
                    0,
                  )
                  .toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Self-Pickup Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Pickup Queue (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  คิวนัดรับยาวันนี้ (Self-Pickup Queue)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {todayPickups.length} คิวค้างอยู่
                </span>
              </div>

              {todayPickups.length === 0 ? (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2">
                  <Package className="h-10 w-10 text-slate-200" />
                  <p className="text-xs">ไม่มีคนไข้ที่มีนัดรับยาอยู่ในตอนนี้</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayPickups.map((o) => (
                    <div
                      key={o._id}
                      className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold tabular-nums">
                            ID: #{o._id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              o.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : o.status === "preparing"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-teal-50 text-teal-700 border border-teal-200"
                            }`}
                          >
                            {o.status === "pending" && "รอดำเนินการ"}
                            {o.status === "preparing" && "กำลังจัดเตรียมยา"}
                            {o.status === "ready" && "ยาพร้อมมารับแล้ว"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>
                            กำหนดมารับยา: {o.estimatedTime || "15-20 นาที"}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400">
                          สร้างคำสั่งซื้อเมื่อ:{" "}
                          {new Date(o.createAt).toLocaleTimeString("th-TH")} น.
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {o.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(o._id, "preparing")
                            }
                            className="h-9 rounded-xl bg-primary hover:bg-primary/95 text-xs px-4"
                          >
                            <Loader2 className="h-3.5 w-3.5 mr-1" />
                            เริ่มจัดยา
                          </Button>
                        )}

                        {o.status === "preparing" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(o._id, "ready")}
                            className="h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs px-4"
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            จัดยาเสร็จแล้ว (Mark Ready)
                          </Button>
                        )}

                        {o.status === "ready" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setVerifyingOrder(o);
                              setOtpInput("");
                            }}
                            className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 gap-1 font-bold shadow-md shadow-emerald-600/20"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            ยืนยันรับยา (Verify OTP)
                          </Button>
                        )}

                        <span className="text-xs font-extrabold text-slate-800 tabular-nums px-2 bg-slate-50 border border-slate-100 rounded-lg py-1">
                          ฿{o.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area (Completed / Info) */}
          <div className="space-y-6">
            {/* Completed Pickup List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-3 border-slate-100 flex items-center gap-1.5">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                ประวัติการจ่ายยาวันนี้ ({completedPickups.length})
              </h3>

              {completedPickups.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  ยังไม่มีรายการรับยาสำเร็จวันนี้
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {completedPickups.map((o) => (
                    <div
                      key={o._id}
                      className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">ID: #{o._id}</p>
                        <p className="text-[10px] text-slate-400">
                          เสร็จเมื่อ:{" "}
                          {new Date(o.createAt).toLocaleTimeString("th-TH")}
                        </p>
                      </div>
                      <span className="font-mono text-emerald-600 font-extrabold">
                        ฿{o.total}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-6 border border-primary/10 space-y-3">
              <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                💡 ข้อแนะนำสำหรับร้านขายยา
              </h4>
              <p className="text-[11px] text-slate-500 leading-[1.8]">
                1. เมื่อจัดเตรียมยากดปุ่ม{" "}
                <b>{`"จัดยาเสร็จแล้ว (Mark Ready)"`}</b>{" "}
                ระบบจะแจ้งเตือนฝั่งคนไข้ทันที
                <br />
                2. คนไข้เดินทางมาถึงร้าน จะยื่น <b>
                  รหัสรับยา OTP (สีทอง)
                </b>{" "}
                ให้ตรวจสอบก่อนกดจ่ายยา
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {verifyingOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setVerifyingOrder(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-6 text-center">
            <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Lock className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900">
                ตรวจสอบรหัสรับยา
              </h3>
              <p className="text-xs text-slate-500">
                กรอกรหัสยืนยัน OTP จากสมาร์ทโฟนของคนไข้เพื่อยืนยันตัวตน
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                placeholder="กรอกรหัส OTP 4 หลัก"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.toUpperCase())}
                className="h-12 text-center text-lg font-bold tracking-widest rounded-xl"
                maxLength={4}
                required
                autoFocus
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl text-xs"
                  onClick={() => setVerifyingOrder(null)}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  ส่งมอบยาเสร็จสิ้น
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
