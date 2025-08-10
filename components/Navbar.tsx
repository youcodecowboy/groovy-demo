"use client"

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Navbar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full bg-white border-b-2 border-black",
        className,
      )}
    >
      <div className="container mx-auto grid grid-cols-[auto,1fr,auto] items-center px-2 md:px-4 h-16 md:h-20">
        {/* left */}
        <div className="flex items-center pr-4 border-r-2 border-black h-full">
          <Link href="/" className="flex items-center pl-1 md:pl-2">
            <Image src="/groovy-logo.png" alt="Groovy" width={160} height={48} className="h-9 md:h-10 w-auto" />
          </Link>
        </div>
        {/* center (intentionally empty for stealth) */}
        <div />
        {/* right */}
        <div className="flex items-center pl-4 border-l-2 border-black h-full gap-3 justify-end pr-1 md:pr-2">
          <Button asChild className="h-10 md:h-12 px-4 md:px-5 rounded-[6px] border-2 border-sky-600 text-sky-700 italic bg-white hover:bg-sky-50 active:translate-y-[1px] focus-visible:ring-2 focus-visible:ring-sky-600">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            asChild
            className="h-10 md:h-12 px-4 md:px-5 rounded-[6px] border-2 border-black bg-black text-white hover:bg-zinc-900 active:translate-y-[1px] focus-visible:ring-2 focus-visible:ring-black"
          >
            <Link href="/sign-up">Request Access</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Navbar


