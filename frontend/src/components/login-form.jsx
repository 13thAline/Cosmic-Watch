import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({ className, ...props }) {
  return (
    <form
      className={cn("flex flex-col gap-6 text-white", className)}
      {...props}
    >
      <FieldGroup>

        {/* HEADER */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Login to your account
          </h1>
          <p className="text-gray-400 text-sm text-balance">
            Enter your credentials to continue monitoring cosmic threats.
          </p>
        </div>

        {/* EMAIL */}
        <Field>
          <FieldLabel className="text-gray-300">Email</FieldLabel>
          <Input
            type="email"
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
        </Field>

        {/* PASSWORD */}
        <Field>
          <div className="flex items-center">
            <FieldLabel className="text-gray-300">Password</FieldLabel>
            <a
              href="#"
              className="
                ml-auto text-xs
                text-[#FFB089]
                hover:text-[#FF6A2A]
                transition
              "
            >
              Forgot password?
            </a>
          </div>
          <Input
            type="password"
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
        </Field>

        {/* PRIMARY CTA */}
        <Field>
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
            Login
          </Button>
        </Field>

        {/* COSMIC DIVIDER */}
        <FieldSeparator className="relative text-xs text-[#FFB089]/80">
          <span className="px-3 bg-black">
            Or continue with
          </span>
        </FieldSeparator>

        {/* OAUTH */}
        <Field>
          <Button
            variant="outline"
            type="button"
            className="
              w-full
              border-white/15
              bg-black/30
              text-white
              hover:bg-white/10
              hover:border-[#FF6A2A]/50
              transition
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4 text-white"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Continue with GitHub
          </Button>

          {/* FOOTER LINK */}
          <FieldDescription className="text-center text-gray-400">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="
                text-[#FFB089]
                hover:text-[#FF6A2A]
                underline underline-offset-4
                transition
              "
            >
              Sign up
            </a>
          </FieldDescription>
        </Field>

      </FieldGroup>
    </form>
  )
}
