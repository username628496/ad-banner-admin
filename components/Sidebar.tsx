'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Image, Link2, Zap, Building2 } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/brands', label: 'Nhà Cái', icon: Building2 },
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
      {/* Logo area */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>AdBanner</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.2 }}>v4.0</span>
          </div>
        </div>
      </div>

      {/* Nav section */}
      <nav style={{ flex: 1, padding: '10px 8px' }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          padding: '8px 8px 5px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          MENU
        </div>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => setHovered(href)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: isActive ? '7px 7px' : '7px 10px',
                paddingLeft: isActive ? '7px' : '10px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontSize: '13px',
                marginBottom: '2px',
                transition: 'all 0.1s',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive
                  ? 'var(--accent-light)'
                  : hovered === href
                    ? '#F1F5F9'
                    : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        fontSize: '11px',
        color: 'var(--text-muted)',
      }}>
        Ad Banner System
      </div>
    </aside>
  )
}
