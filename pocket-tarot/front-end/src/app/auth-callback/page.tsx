"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true" && token) {
      // Store the token
      localStorage.setItem("tarot_token", token);

      // Redirect to home page
      router.push("/");
    } else {
      // Handle error
      console.error("Authentication failed:", error);
      router.push("/?auth_error=true");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Нэвтэрч байна...</h2>
        <p className="text-purple-200">Уучлаарай, түр хүлээнэ үү</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Уншиж байна...</h2>
            <p className="text-purple-200">Уучлаарай, түр хүлээнэ үү</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
