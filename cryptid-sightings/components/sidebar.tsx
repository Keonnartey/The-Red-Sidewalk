// components/Sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MapPinned,
  Filter,
  MapPinPlus,
  Users,
  UserPlus,
  BookOpen,
  User
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const linkClass = (path: string) =>
    `w-[80px] h-[80px] rounded-lg flex items-center justify-center
     ${pathname === path ? "bg-[#dacfff]" : "bg-white"}`

  const iconColor = "text-[#1e1d4a] w-10 h-10"

  return (
    <div className="w-[130px] bg-[#1e1d4a] flex flex-col items-center py-4 gap-8 shrink-0">
      <Link href="/" className={linkClass("/")}>
        <MapPinned className={iconColor} />
      </Link>
      <Link href="/filter" className={linkClass("/filter")}>
        <Filter className={iconColor} />
      </Link>
      <Link href="/report" className={linkClass("/report")}>
        <MapPinPlus className={iconColor} />
      </Link>
      <Link href="/discuss" className={linkClass("/discuss")}>
        <Users className={iconColor} />
      </Link>
      {/* ✅ new Socialness link */}
      <Link href="/socialness" className={linkClass("/socialness")}>
        <UserPlus className={iconColor} />
      </Link>
      <Link href="/creatures" className={linkClass("/creatures")}>
        <BookOpen className={iconColor} />
      </Link>
      <Link href="/profile" className={linkClass("/profile")}>
        <User className={iconColor} />
      </Link>
    </div>
  )
}
