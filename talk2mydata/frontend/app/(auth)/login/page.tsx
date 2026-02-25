"use client";

import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { setToken, setUser } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { jwtDecode } from "@/lib/jwt";

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential;
    if (!token) return;

    setToken(token);

    // Decode token for user info
    const decoded = jwtDecode(token);
    setUser({
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    });

    // Verify with backend (creates user if needed)
    try {
      await apiClient.post("/api/v1/auth/verify");
    } catch {
      // Non-blocking - user record will be created on next request
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-sm mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Talk<span className="text-primary">2</span>MyData
          </h1>
          <p className="text-muted-foreground">Sign in to get started</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => {}}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="300"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
