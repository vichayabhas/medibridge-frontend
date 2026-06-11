import ChoosePharmacistPage from "@/components/ChoosePharmacistPage";
import loadAllPharmacyAndPharmacist from "@/libs/main/loadAllPharmacyAndPharmacist";
import React from "react";
export default async function page() {
  const data = await loadAllPharmacyAndPharmacist();
  return <ChoosePharmacistPage pharmacists={data.pharmacists} />;
}
