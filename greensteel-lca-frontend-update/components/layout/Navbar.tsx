"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <nav className="border-b border-border/40 px-4 md:px-6 py-3 md:py-4 font-extrabold bg-background sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* 햄버거 버튼 (모바일 전용) */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent focus:outline-none"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg
              className="h-6 w-6 text-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* 로고 */}
          <h1 className="text-foreground font-extrabold whitespace-nowrap text-2xl md:text-3xl">
            GreenSteel LCA
          </h1>

          {/* 우측 메뉴 (데스크탑 전용) */}
          <div className="hidden md:block">
            {/* 필요시 여기에 Select 컴포넌트를 추가 */}
          </div>
        </div>
      </nav>

      {/* 모바일 사이드바 Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* 오버레이 */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* 사이드바 슬라이드 */}
            <motion.div
              className="fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
