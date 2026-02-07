import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SignupForm({ onSubmit, className }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔴 critical
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData); // 🔥 THIS connects to Register.jsx
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full space-y-6 text-white", className)}
    >
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-sm text-gray-400">
          Start monitoring near-Earth objects in real time.
        </p>
      </div>

      {/* EMAIL */}
      <div className="space-y-2">
        <Label className="text-gray-300">Email</Label>
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
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
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
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
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* CTA */}
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
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
