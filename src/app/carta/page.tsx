"use client";

import { useState } from "react";
import Carta from "@/components/Carta";
import Link from "next/link";
import Head from "next/head";

export default function CartaPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Head>
        <title>Carta - Las Mesas Café Bar</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Carta />
      </div>
    </div>
  );
}