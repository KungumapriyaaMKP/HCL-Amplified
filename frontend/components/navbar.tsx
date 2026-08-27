"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/frontend/components/ui/resizable-navbar";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

export default function AppNavbar() {
  const navItems = [
    {
      name: "Dashboard",
      link: "/dashboard",
    },
    {
      name: "Leaderboard",
      link: "/leaderboard",
    },
    {
      name: "Community",
      link: "/community",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Redirect to login after successful logout
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback redirect even if there's an error
      window.location.href = "/login";
    }
  };

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          {/* Logo - Shows on scroll */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "auto" }}
            viewport={{ once: false }}
            className="hidden lg:flex items-center gap-2"
          >
            <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              Pathwise
            </div>
          </motion.div>

          <NavItems items={navItems} />
          <div className="flex items-center gap-4 ml-auto">
            <NavbarButton
              href="/dashboard"
              variant="secondary"
              className="text-black/70 hover:text-black"
            >
              Jayanth
            </NavbarButton>
            <NavbarButton
              variant="secondary"
              onClick={handleLogout}
              className="text-black/70 hover:text-black"
            >
              Log out
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <span className="text-black font-semibold text-lg">Pathwise</span>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-black/70 hover:text-black transition-colors w-full py-2"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="w-full border-t border-white/10 pt-4 mt-4 flex flex-col gap-2">
              <NavbarButton
                href="/dashboard"
                variant="secondary"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-left"
              >
                Jayanth
              </NavbarButton>
              <NavbarButton
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                variant="secondary"
                className="w-full text-left"
              >
                Log out
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
