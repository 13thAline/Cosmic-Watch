import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData); // backend hooks here
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-6"
    >
      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-white">
          Create account
        </h1>
        <p className="text-sm text-gray-400">
          Start monitoring near-Earth objects in real time.
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label className="text-gray-300">Email</Label>
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="bg-black/40 border-white/20 text-white focus:border-[#FF6A2A]"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label className="text-gray-300">Password</Label>
        <Input
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          className="bg-black/40 border-white/20 text-white focus:border-[#FF6A2A]"
        />
      </div>

      {/* CTA */}
      <Button
        type="submit"
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
        Create Account
      </Button>

      {/* Footer */}
      <p className="text-sm text-gray-400">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-[#FFB089] hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
