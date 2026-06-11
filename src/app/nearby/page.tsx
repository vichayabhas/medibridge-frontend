import NearbyPage from "@/components/nearby/NearbyPage";
import loadAllPharmacyAndPharmacist from "@/libs/main/loadAllPharmacyAndPharmacist";
import React from "react";
export default async function page() {
  const data = await loadAllPharmacyAndPharmacist();
  return (
    <NearbyPage
      pharmacists={data.pharmacists}
      allPharmacies={data.pharmacies}
    />
  );
}
