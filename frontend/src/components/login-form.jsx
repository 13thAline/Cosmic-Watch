import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/authContext";

export function LoginForm({ className }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });   // 🔥 backend call
      navigate("/dashboard");             // 🔥 redirect
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6 text-white", className)}
    >
      {/* HEADER */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Login to your account
        </h1>
        <p className="text-gray-400 text-sm">
          Access real-time asteroid intelligence and threat monitoring.
        </p>
      </div>

      {/* EMAIL */}
      <div className="space-y-2">
        <Label className="text-gray-300">Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="
            bg-black/40
            border-white/20
            text-white
            placeholder:text-gray-500
            focus:border-[#FF6A2A]
            focus:ring-0
          "
        />
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <Label className="text-gray-300">Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="
            bg-black/40
            border-white/20
            text-white
            placeholder:text-gray-500
            focus:border-[#FF6A2A]
            focus:ring-0
          "
        />
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-sm text-red-400 text-center">
          {error}
        </p>
      )}

      {/* LOGIN BUTTON */}
      <Button
        type="submit"
        disabled={loading}
        className="
          w-full
          bg-gradient-to-r
          from-[#FFB089]
          to-[#FF6A2A]
          text-black
          font-medium
          hover:opacity-90
        "
      >
        {loading ? "Signing in..." : "Login"}
      </Button>

      {/* FOOTER */}
      <p className="text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="
            text-[#FFB089]
            hover:text-[#FF6A2A]
            underline underline-offset-4
            transition
          "
        >
          Sign up
        </button>
      </p>
    </form>
  );
}
