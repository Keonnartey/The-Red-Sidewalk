"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Filter, BarChart2, Users, BookOpen, User } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[130px] bg-[#1e1d4a] flex flex-col items-center py-4 gap-8 shrink-0">
      <Link
        href="/"
        className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center ${pathname === "/" ? "bg-[#dacfff]" : "bg-white"}`}
      >
        <Filter className={`w-10 h-10 ${pathname === "/" ? "text-[#1e1d4a]" : "text-[#1e1d4a]"}`} />
      </Link>
      <Link
        href="/report"
        className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center ${pathname === "/report" ? "bg-[#dacfff]" : "bg-white"}`}
      >
        <BarChart2 className={`w-10 h-10 ${pathname === "/report" ? "text-[#1e1d4a]" : "text-[#1e1d4a]"}`} />
      </Link>
      <Link
        href="/discuss"
        className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center ${pathname === "/discuss" ? "bg-[#dacfff]" : "bg-white"}`}
      >
        <Users className={`w-10 h-10 ${pathname === "/discuss" ? "text-[#1e1d4a]" : "text-[#1e1d4a]"}`} />
      </Link>
      <Link
        href="/creatures"
        className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center ${pathname === "/creatures" ? "bg-[#dacfff]" : "bg-white"}`}
      >
        <BookOpen className={`w-10 h-10 ${pathname === "/creatures" ? "text-[#1e1d4a]" : "text-[#1e1d4a]"}`} />
      </Link>
      <Link
        href="/profile"
        className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center ${pathname === "/profile" ? "bg-[#dacfff]" : "bg-white"}`}
      >
        <User className={`w-10 h-10 ${pathname === "/profile" ? "text-[#1e1d4a]" : "text-[#1e1d4a]"}`} />
      </Link>
    </div>
  )
}

