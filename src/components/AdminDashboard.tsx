/* eslint-disable @typescript-eslint/no-explicit-any */
// import { supabase } from "@/lib/supabase";
import React from "react";
import { toast } from "sonner";
import {
  ShieldAlert,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  FileCheck,
  Building,
  Search,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminData,
  ArticleReady,
  PharmacistType,
  PharmacyWithDistance,
} from "../../interface";
import { io } from "socket.io-client";
import { getBackendUrl, SocketReady } from "./utility/setup";
import articleAction from "@/libs/main/articleAction";
import pharmacistAction from "@/libs/main/pharmacistAction";

// interface PendingPharmacy {
//   id: string;
//   name: string;
//   address: string;
//   phone: string;
//   verificationStatus: "pending" | "verified" | "rejected";
//   created_at: string;
// }

// interface PendingPharmacist {
//   id: string;
//   name: string;
//   license_no: string;
//   workplace: string;
//   experience: number;
//   verificationStatus: "pending" | "verified" | "rejected";
//   created_at: string;
// }

// interface PendingArticle {
//   id: string;
//   title: string;
//   category: string;
//   excerpt: string;
//   authorName: string;
//   status: "pending" | "approved" | "rejected";
//   created_at: string;
// }
const socket = io(getBackendUrl());
export default function AdminDashboard({
  data,
  token,
}: {
  data: AdminData;
  token: string;
}) {
  const [pharmacies, setPharmacies] = React.useState(data.pharmacies);
  const [pharmacists, setPharmacists] = React.useState(data.pharmacists);
  const [articles, setArticles] = React.useState(data.articles);
  // const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<
    "pharmacies" | "pharmacists" | "articles"
  >("pharmacies");
  const articleSocket = new SocketReady<ArticleReady[]>(
    socket,
    "update-article",
    "",
  );
  const pharmacySocket = new SocketReady<PharmacyWithDistance[]>(
    socket,
    "update-pharmacy",
    "",
  );
  const pharmacistSocket = new SocketReady<PharmacistType[]>(
    socket,
    "update-pharmacist",
    "",
  );

  // Summary counts
  // const [stats, setStats] = useState({
  //   totalPharmacies: 0,
  //   totalPharmacists: 0,
  //   pendingPharmacies: 0,
  //   pendingPharmacists: 0,
  //   pendingArticles: 0,
  // });
  const stats = {
    totalPharmacies: pharmacies.length,
    totalPharmacists: pharmacists.length,
    pendingPharmacies: pharmacies.filter(
      (p) => p.verificationStatus === "pending",
    ).length,
    pendingPharmacists: pharmacists.filter(
      (p) => p.verificationStatus === "pending",
    ).length,
    pendingArticles: articles.filter((a) => a.status === "pending").length,
  };
  React.useEffect(() => {
    articleSocket.listen(setArticles);
    pharmacistSocket.listen(setPharmacists);
    pharmacySocket.listen(setPharmacies);
    return () => {
      articleSocket.disconnect();
      pharmacistSocket.disconnect();
      pharmacySocket.disconnect();
    };
  });

  // const fetchData = async () => {
  //   setLoading(true);
  //   try {
  //     // 1. Fetch Stats
  //     // const [
  //     //   { count: totalPharmaciesCount },
  //     //   { count: totalPharmacistsCount },
  //     //   { data: pendingPharmaciesData },
  //     //   { data: pendingPharmacistsData },
  //     //   { data: articlesData },
  //     //   { data: pharmacistsData },
  //     // ] = await Promise.all([
  //     //   supabase.from("pharmacies").select("*", { count: "exact", head: true }),
  //     //   supabase
  //     //     .from("pharmacists")
  //     //     .select("*", { count: "exact", head: true }),
  //     //   supabase
  //     //     .from("pharmacies")
  //     //     .select("id, name, address, phone, verificationStatus, created_at")
  //     //     .order("created_at", { ascending: false }),
  //     //   supabase
  //     //     .from("pharmacists")
  //     //     .select(
  //     //       "id, name, license_no, workplace, experience, verificationStatus, created_at",
  //     //     )
  //     //     .order("created_at", { ascending: false }),
  //     //   supabase
  //     //     .from("articles")
  //     //     .select("*")
  //     //     .order("created_at", { ascending: false }),
  //     //   supabase.from("pharmacists").select("id, name"),
  //     // ]);
  //     // const allPharmacies = (pendingPharmaciesData as PendingPharmacy[]) || [];
  //     // const allPharmacists =
  //     //   (pendingPharmacistsData as PendingPharmacist[]) || [];
  //     // const pharmaMap = new Map(
  //     //   (pharmacistsData || []).map((p: any) => [p.id, p.name]),
  //     // );
  //     // const allArticles = (articlesData || []).map((a: any) => ({
  //     //   id: a.id,
  //     //   title: a.title,
  //     //   category: a.category,
  //     //   excerpt: a.excerpt,
  //     //   authorName: pharmaMap.get(a.author_id) || "เภสัชกร Medibridge",
  //     //   status: a.status || "pending",
  //     //   created_at: a.created_at,
  //     // })) as PendingArticle[];
  //     // setPharmacies(allPharmacies);
  //     // setPharmacists(allPharmacists);
  //     // setArticles(allArticles);
  //     // setStats({
  //     //   totalPharmacies: totalPharmaciesCount || 0,
  //     //   totalPharmacists: totalPharmacistsCount || 0,
  //     //   pendingPharmacies: allPharmacies.filter(
  //     //     (p) => p.verificationStatus === "pending",
  //     //   ).length,
  //     //   pendingPharmacists: allPharmacists.filter(
  //     //     (p) => p.verificationStatus === "pending",
  //     //   ).length,
  //     //   pendingArticles: allArticles.filter((a) => a.status === "pending")
  //     //     .length,
  //     // });
  //   } catch (err: any) {
  //     toast.error("ดึงข้อมูลไม่สำเร็จ: " + err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  const handleApprovePharmacy = async (id: string) => {
    try {
      const newData = await pharmacistAction(
        { verificationStatus: "verified" },
        token,
        id,
      );
      pharmacySocket.trigger(newData.pharmacies);

      toast.success("อนุมัติร้านขายยาเรียบร้อยแล้ว");
    } catch (err: any) {
      toast.error("อนุมัติไม่สำเร็จ: " + err.message);
    }
  };

  const handleRejectPharmacy = async (id: string) => {
    try {
      const newData = await pharmacistAction(
        { verificationStatus: "rejected" },
        token,
        id,
      );
      pharmacySocket.trigger(newData.pharmacies);
      toast.error("ปฏิเสธคำขอร้านขายยาเรียบร้อยแล้ว");
    } catch (err: any) {
      toast.error("ปฏิเสธไม่สำเร็จ: " + err.message);
    }
  };

  const handleApprovePharmacist = async (id: string) => {
    try {
      const newData = await pharmacistAction(
        { verificationStatus: "verified" },
        token,
        id,
      );
      pharmacistSocket.trigger(newData.pharmacists);

      toast.success("อนุมัติเภสัชกรเรียบร้อยแล้ว");
    } catch (err: any) {
      toast.error("อนุมัติไม่สำเร็จ: " + err.message);
    }
  };

  const handleRejectPharmacist = async (id: string) => {
    try {
      const newData = await pharmacistAction(
        { verificationStatus: "rejected" },
        token,
        id,
      );
      pharmacistSocket.trigger(newData.pharmacists);

      toast.error("ปฏิเสธคำขอเภสัชกรเรียบร้อยแล้ว");
    } catch (err: any) {
      toast.error("ปฏิเสธไม่สำเร็จ: " + err.message);
    }
  };

  const handleApproveArticle = async (id: string) => {
    try {
      const newData = await articleAction({ status: "approved" }, token, id);
      articleSocket.trigger(newData);

      toast.success("อนุมัติบทความเรียบร้อยแล้ว");
    } catch (err: any) {
      toast.error("อนุมัติไม่สำเร็จ: " + err.message);
    }
  };

  const handleRejectArticle = async (id: string) => {
    try {
      const newData = await articleAction({ status: "rejected" }, token, id);
      articleSocket.trigger(newData);

      toast.error("ปฏิเสธบทความเรียบร้อยแล้ว");
    } catch (err: any) {
      toast.error("ปฏิเสธไม่สำเร็จ: " + err.message);
    }
  };

  const filteredPharmacies = pharmacies.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredPharmacists = pharmacists.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licenseNo.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.authorName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 mt-14">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6 border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-primary" />
              แผงควบคุมผู้ดูแลระบบ (Admin Dashboard)
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              อนุมัติคำขอเปิดร้านขายยา,การขึ้นทะเบียนเภสัชกร และบทความสุขภาพ
            </p>
          </div>
          {/* <Button
            variant="outline"
            className="self-start md:self-auto gap-2 rounded-xl"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            กำลังโหลดข้อมูลใหม่
          </Button> */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                ร้านขายยาทั้งหมด
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.totalPharmacies} ร้าน
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-50 rounded-xl">
              <Users className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                เภสัชกรในระบบ
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.totalPharmacists} คน
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Building2 className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                ร้านยารออนุมัติ
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.pendingPharmacies} คำขอ
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <FileCheck className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                เภสัชกรรออนุมัติ
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.pendingPharmacists} คำขอ
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-xl">
              <BookOpen className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">
                บทความรออนุมัติ
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.pendingArticles} คำขอ
              </h3>
            </div>
          </div>
        </div>

        {/* Tab Controls & Search */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b gap-4">
            {/* Tabs */}
            <div className="flex border rounded-xl p-1 bg-slate-50 border-slate-100 self-start">
              <button
                onClick={() => {
                  setActiveTab("pharmacies");
                  setSearchTerm("");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "pharmacies"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                ร้านขายยา ({pharmacies.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("pharmacists");
                  setSearchTerm("");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "pharmacists"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                เภสัชกร ({pharmacists.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("articles");
                  setSearchTerm("");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "articles"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                บทความ ({articles.length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-xl text-xs bg-slate-50 border-slate-100 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="p-6">
            {
              // loading ? (
              //   <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              //     <Loader2 className="h-8 w-8 animate-spin text-primary" />
              //     <p className="text-xs">กำลังโหลดข้อมูลตรวจสอบ...</p>
              //   </div>
              // ) :
              activeTab === "pharmacies" ? (
                filteredPharmacies.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    ไม่พบคำขอของร้านขายยา
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold pb-3">
                          <th className="pb-3 pr-4">ชื่อร้าน</th>
                          <th className="pb-3 pr-4">ที่อยู่</th>
                          <th className="pb-3 pr-4">เบอร์โทร</th>
                          <th className="pb-3 pr-4 text-center">สถานะ</th>
                          <th className="pb-3 pr-4 text-center">จัดการคำขอ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPharmacies.map((p) => (
                          <tr
                            key={p._id}
                            className="text-slate-600 text-xs font-medium"
                          >
                            <td className="py-4 pr-4 font-bold text-slate-900">
                              {p.name}
                            </td>
                            <td className="py-4 pr-4 max-w-xs truncate">
                              {p.address}
                            </td>
                            <td className="py-4 pr-4 tabular-nums">
                              {p.phone}
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  p.verificationStatus === "verified"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : p.verificationStatus === "rejected"
                                      ? "bg-rose-50 text-rose-700"
                                      : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {p.verificationStatus === "verified" &&
                                  "อนุมัติแล้ว"}
                                {p.verificationStatus === "rejected" &&
                                  "ปฏิเสธแล้ว"}
                                {p.verificationStatus === "pending" &&
                                  "รอการตรวจสอบ"}
                              </span>
                            </td>
                            <td className="py-4 text-center">
                              {p.verificationStatus === "pending" ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprovePharmacy(p._id)}
                                    className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    อนุมัติ
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectPharmacy(p._id)}
                                    className="h-8 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 gap-1"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    ปฏิเสธ
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-slate-400">
                                  ทำรายการเรียบร้อย
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : activeTab === "pharmacists" ? (
                filteredPharmacists.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    ไม่พบคำขอของเภสัชกร
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold pb-3">
                          <th className="pb-3 pr-4">ชื่อผู้สมัคร</th>
                          <th className="pb-3 pr-4">เลขใบอนุญาต</th>
                          <th className="pb-3 pr-4">สถานที่ปฏิบัติงาน</th>
                          <th className="pb-3 pr-4 text-center">ประสบการณ์</th>
                          <th className="pb-3 pr-4 text-center">สถานะ</th>
                          <th className="pb-3 pr-4 text-center">จัดการคำขอ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPharmacists.map((ph) => (
                          <tr
                            key={ph._id}
                            className="text-slate-600 text-xs font-medium"
                          >
                            <td className="py-4 pr-4 font-bold text-slate-900">
                              {ph.name}
                            </td>
                            <td className="py-4 pr-4 font-mono text-slate-500">
                              {ph.licenseNo}
                            </td>
                            <td className="py-4 pr-4">
                              {ph.workplace || "ยังไม่ได้ตั้งค่า"}
                            </td>
                            <td className="py-4 pr-4 text-center tabular-nums">
                              {ph.experience} ปี
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  ph.verificationStatus === "verified"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : ph.verificationStatus === "rejected"
                                      ? "bg-rose-50 text-rose-700"
                                      : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {ph.verificationStatus === "verified" &&
                                  "อนุมัติแล้ว"}
                                {ph.verificationStatus === "rejected" &&
                                  "ปฏิเสธแล้ว"}
                                {ph.verificationStatus === "pending" &&
                                  "รอการตรวจสอบ"}
                              </span>
                            </td>
                            <td className="py-4 text-center">
                              {ph.verificationStatus === "pending" ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApprovePharmacist(ph._id)
                                    }
                                    className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    อนุมัติ
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleRejectPharmacist(ph._id)
                                    }
                                    className="h-8 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 gap-1"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    ปฏิเสธ
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-slate-400">
                                  ทำรายการเรียบร้อย
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  ไม่พบคำขอบทความ
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold pb-3">
                        <th className="pb-3 pr-4">หัวข้อบทความ</th>
                        <th className="pb-3 pr-4">ผู้เขียน</th>
                        <th className="pb-3 pr-4">หมวดหมู่</th>
                        <th className="pb-3 pr-4 text-center">สถานะ</th>
                        <th className="pb-3 pr-4 text-center">จัดการคำขอ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredArticles.map((art) => (
                        <tr
                          key={art._id}
                          className="text-slate-600 text-xs font-medium"
                        >
                          <td className="py-4 pr-4 font-bold text-slate-900">
                            <a
                              href={`/articles/${art._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary hover:underline flex items-center gap-1.5"
                            >
                              {art.title}
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </a>
                          </td>
                          <td className="py-4 pr-4">{art.authorName}</td>
                          <td className="py-4 pr-4">
                            <span className="capitalize">
                              {art.category?.toLowerCase() === "health_tip"
                                ? "เคล็ดลับสุขภาพ"
                                : art.category?.toLowerCase() === "review"
                                  ? "รีวิว"
                                  : "สินค้า"}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                art.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : art.status === "rejected"
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {art.status === "approved" && "อนุมัติแล้ว"}
                              {art.status === "rejected" && "ปฏิเสธแล้ว"}
                              {art.status === "pending" && "รอการตรวจสอบ"}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            {art.status === "pending" ? (
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveArticle(art._id)}
                                  className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  อนุมัติ
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectArticle(art._id)}
                                  className="h-8 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 gap-1"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  ปฏิเสธ
                                </Button>
                              </div>
                            ) : (
                              <span className="text-slate-400">
                                ทำรายการเรียบร้อย
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
