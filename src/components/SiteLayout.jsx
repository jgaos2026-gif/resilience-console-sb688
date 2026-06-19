import React from "react";
import { Outlet } from "react-router-dom";
import SiteDisclaimer from "@/components/SiteDisclaimer";

export default function SiteLayout() {
  return (
    <>
      <SiteDisclaimer />
      <Outlet />
    </>
  );
}