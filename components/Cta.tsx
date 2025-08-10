"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const emailRe = /.+@.+\..+/

export function Cta() {
  const [email, setEmail] = useState("")
  const [success, setSuccess] = useState(false)
  const liveRef = useRef<HTMLDivElement | null>(null)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailRe.test(email)) {
      setSuccess(false)
      liveRef.current && (liveRef.current.textContent = "Enter a valid email.")
      return
    }
    setSuccess(true)
    liveRef.current && (liveRef.current.textContent = "Thanks! We'll be in touch.")
    setEmail("")
  }

  return (
    <section id="contact" className="relative container mx-auto px-4 py-16">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-black" aria-hidden />
      <div className="rounded-md border-2 border-black bg-white p-6 md:p-8 text-center">
        <h2 className="text-3xl md:text-4xl text-zinc-900 font-semibold tracking-tight">Request early access</h2>
        <p className="mt-2 text-zinc-700">We’ll reach out with next steps. No spam.</p>
        {!success ? (
          <form onSubmit={onSubmit} className="mt-6 mx-auto max-w-xl flex flex-col sm:flex-row gap-3 items-center">
            <Input
              type="email"
              inputMode="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-white border-zinc-200/70 focus-visible:ring-sky-300"
              aria-label="Email"
              required
            />
            <Button type="submit" className="h-11 px-5 bg-sky-500 hover:bg-sky-600">Notify me</Button>
          </form>
        ) : (
          <div className="mt-6 text-sky-700">Thanks! We'll be in touch.</div>
        )}
        <div ref={liveRef} className="sr-only" aria-live="polite" />
        <div className="mt-4">
          <a
            href="/sign-up"
            className="inline-flex h-11 items-center rounded-md bg-sky-500 px-5 text-white hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            Request Access
          </a>
        </div>
        <div className="mt-3 text-xs text-zinc-600">We respect your privacy. We’ll never share your email.</div>
      </div>
    </section>
  )
}

export default Cta


