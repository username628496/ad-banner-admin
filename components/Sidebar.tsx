'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Image, Zap, Building2 } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin/brands', label: 'Brands', icon: Building2 },
  { href: '/admin/banners', label: 'Banners', icon: Image },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <aside style={{
      width: '200px',
      background: '#FFFFFF',
      borderRight: '1px solid var(--border)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(37,99,235,0.35)',
          }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>AdBanner</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>Admin v4.0</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px' }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          padding: '6px 8px 8px', textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          Navigation
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => setHovered(href)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '8px 10px',
                borderRadius: '7px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                marginBottom: '2px',
                transition: 'all 0.12s',
                color: isActive ? '#2563EB' : 'var(--text-secondary)',
                background: isActive ? '#EFF6FF' : hovered === href ? '#F8FAFC' : 'transparent',
                borderLeft: `3px solid ${isActive ? '#2563EB' : 'transparent'}`,
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        fontSize: '11px', color: 'var(--text-muted)',
      }}>
        Ad Banner System
      </div>
    </aside>
  )
}
