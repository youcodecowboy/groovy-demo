"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, Linkedin } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  const [email, setEmail] = useState("")
  const [success, setSuccess] = useState(false)
  const liveRef = useRef<HTMLDivElement | null>(null)

  const emailRe = /.+@.+\..+/
  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!emailRe.test(email)) {
      liveRef.current && (liveRef.current.textContent = "Enter a valid email.")
      return
    }
    setSuccess(true)
    liveRef.current && (liveRef.current.textContent = "Thanks! We'll be in touch.")
    setEmail("")
  }

  return (
    <footer className="border-t-2 border-black bg-white">
      <div className="container mx-auto px-4 py-14 grid gap-10">
        {/* Top: brand + locations + CTA card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-8 items-start">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image src="/groovy-logo.png" alt="Groovy" width={200} height={60} className="h-12 w-auto" />
            </div>
            <div className="text-zinc-700 max-w-xl">A configurable operating system for your business. Build workflows that fit the way you work.</div>
            <div className="italic text-zinc-800">Groovy — London | Dubai</div>
          </div>
          <div className="rounded-md border-2 border-black p-6 md:p-7 bg-white">
            <div className="text-xl md:text-2xl text-zinc-900 font-semibold tracking-tight">Request early access</div>
            <div className="mt-1 text-sm text-zinc-700">We’ll reach out with next steps. No spam.</div>
            {!success ? (
              <form onSubmit={onSubmit} className="mt-5 flex flex-col sm:flex-row gap-3 items-center">
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-white border-zinc-200/70 focus-visible:ring-sky-300 w-full"
                  aria-label="Email"
                  required
                />
                <Button type="submit" className="h-11 px-5 bg-sky-500 hover:bg-sky-600 w-full sm:w-auto">Notify me</Button>
                <Button asChild className="h-11 px-5 border-2 border-black bg-black text-white hover:bg-zinc-900 w-full sm:w-auto">
                  <Link href="/sign-up">Request Access</Link>
                </Button>
              </form>
            ) : (
              <div className="mt-6 text-sky-700">Thanks! We'll be in touch.</div>
            )}
            <div ref={liveRef} className="sr-only" aria-live="polite" />
            <div className="mt-2 text-xs text-zinc-600">We respect your privacy. We’ll never share your email.</div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-200/70">
          <div className="text-sm text-zinc-600">© {new Date().getFullYear()} Groovy</div>
          <nav className="flex items-center gap-6 text-sm text-zinc-700">
            <Link href="#product" className="hover:text-zinc-900">Product</Link>
            <Link href="#why" className="hover:text-zinc-900">Why</Link>
            <Link href="#contact" className="hover:text-zinc-900">Contact</Link>
            <Link href="#privacy" className="hover:text-zinc-900">Privacy</Link>
          </nav>
          <div className="flex items-center gap-4 text-zinc-700">
            <a href="#" aria-label="GitHub" className="hover:text-zinc-900"><Github className="h-5 w-5" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-zinc-900"><Twitter className="h-5 w-5" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-zinc-900"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


