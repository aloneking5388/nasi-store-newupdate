"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";

function UnsubscribeContent() {
  const [status, setStatus] = useState("Processing...");
  const params = useSearchParams();
  const email = params.get("email");

  useEffect(() => {
    if (!email) {
      setStatus("Missing email.");
      return;
    }

    const unsubscribe = async () => {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("You've been unsubscribed successfully.");
      } else {
        setStatus(data.error || "Unsubscribe failed.");
      }
    };

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">{status}</p>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" />
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
