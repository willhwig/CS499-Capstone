/**
 * Root Layout Component
 * CS499 Capstone Project
 *
 * This is the root layout for the entire application.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'


// Page metadata
export const metadata: Metadata = {
  title: 'Asset Tracker - Component Lifecycle Tracking',
  description: 'Track asset component service lifecycles across multiple repair vendors. CS499 Capstone Project.',
}


// Navigation links configuration
const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/assets', label: 'Assets' },
  { href: '/lookup', label: 'Lookup' },
  { href: '/service', label: 'Record Service' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/audit', label: 'Audit Trail' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Navigation Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and app name */}
              <Link href="/" className="flex items-center space-x-3">
                <AssetLogo />
                <span className="font-bold text-xl text-gray-900">
                  Asset Tracker
                </span>
              </Link>

              {/* Navigation links */}
              <nav className="hidden md:flex space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile menu button */}
              <MobileMenu />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500">
              Asset Component Lifecycle Tracking System - CS499 Capstone Project - William Herwig
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}

// Simple asset/component logo SVG
function AssetLogo() {
  return (
    <svg
      className="w-8 h-8 text-blue-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v7M12 15v7M2 12h7M15 12h7" />
      <path d="M4.93 4.93l4.95 4.95M14.12 14.12l4.95 4.95M4.93 19.07l4.95-4.95M14.12 9.88l4.95-4.95" />
    </svg>
  )
}


// Mobile Menu Component
function MobileMenu() {
  return (
    <div className="md:hidden">
      <details className="relative">
        <summary className="list-none cursor-pointer p-2 rounded-md hover:bg-gray-100">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </summary>
        <nav className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </details>
    </div>
  )
}
