import Link from "next/link"

import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-neutral-800 p-4">
          <Icons.warning
            className="h-12 w-12 text-red-500"
            aria-hidden="true"
          />
        </div>
        <div className="mt-2 text-2xl font-medium text-slate-50 sm:text-3xl">
          Not Found
        </div>
        <p className="text-sm text-slate-400 sm:text-base">
          Profile not found. Please try again.
        </p>
      </div>
      <Link
        href="/"
        className={buttonVariants({
          variant: "outline",
          className: "rounded-none",
        })}
      >
        Go to Profiles
      </Link>
    </div>
  )
}
