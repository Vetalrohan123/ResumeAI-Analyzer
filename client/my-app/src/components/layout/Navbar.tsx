"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 w-[calc(100%-24px)] max-w-6xl">
        <nav className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-black/70 px-4 py-3 backdrop-blur-xl md:px-5">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
              <span className="text-sm font-black">R</span>
            </div>

            <span className="text-[15px] font-semibold tracking-tight text-white">
              ResumeAI
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="px-3 py-2 text-sm text-zinc-300 transition hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="/analyze"
              className="group flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Get Started
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-white/10 p-2 text-zinc-300 md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 rounded-2xl border border-white/[0.08] bg-[#0b0b0b]/95 p-4 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-white/[0.06] py-4 text-sm text-zinc-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-3 py-2 text-sm text-zinc-300"
                >
                  Log in
                </Link>

                <Link
                  href="/analyze"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-lg bg-white px-4 py-3 text-center text-sm font-medium text-black"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}