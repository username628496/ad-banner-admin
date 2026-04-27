'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { bannerApi, loginUrlApi } from '@/lib/api'
import { GROUPS, GROUP_LABELS, GROUP_COLORS } from '@/lib/types'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loginCount, setLoginCount] = useState(0)
  const [brandCount, setBrandCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [allRes, loginRes] = await Promise.all([
          bannerApi.getAll(),
          loginUrlApi.getAll(),
        ])
        if (allRes.success && allRes.data) {
          setData(allRes.data)
          setBrandCount(allRes.data.brands?.length || 0)
        }
        if (loginRes.success) {
          setLoginCount(loginRes.data?.length || 0)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalBanners = GROUPS.reduce(
    (s, g) => s + (data?.[`banners_${g}`]?.length || 0),
    0
  )
  const activeBanners = GROUPS.reduce(
    (s, g) => s + (data?.[`banners_${g}`]?.filter((b: any) => b.is_active)?.length || 0),
    0
  )

  const sectionLabel: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '8px',
  }

  const card: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
  }

  const apiUrl = typeof window !== 'undefined'
    ? (localStorage.getItem('api_url') || 'http://localhost:3000')
    : 'http://localhost:3000'

  const endpoints = [
    { label: 'Tất cả data', path: '/api/banners/all' },
    { label: 'Slider banners', path: '/api/banners?group=slider' },
    { label: 'Homepage banners', path: '/api/banners?group=homepage' },
    { label: 'Catfish banners', path: '/api/banners?group=catfish' },
    { label: 'Sidebar banners', path: '/api/banners?group=sidebar' },
    { label: 'Popup banners', path: '/api/banners?group=popup' },
    { label: 'Login URLs', path: '/api/login-urls' },
  ]

  const steps = [
    { step: 1, title: 'Thêm Login URLs', desc: 'Vào Login URLs → Thêm ID và URL đăng nhập/đăng ký cho từng nhà cái.' },
    { step: 2, title: 'Upload Banner', desc: 'Vào Nhà Cái → Mở rộng nhà cái → Upload ảnh cho từng nhóm banner.' },
    { step: 3, title: 'Cài WordPress Plugin', desc: 'Cài plugin, nhập API URL vào settings để plugin tự fetch.' },
    { step: 4, title: 'Dùng Shortcode', desc: '[banner_slider] [banner_homepage] [banner_catfish] [banner_sidebar] [banner_popup]' },
  ]

  return (
    <>
      <Header title="Dashboard" />
      <main style={{ padding: '20px', flex: 1 }}>

        {/* Hero card */}
        <div style={{
          ...card,
          borderLeft: '4px solid var(--accent)',
          padding: '20px 24px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              Ad Banner System
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Quản lý banner tập trung · WordPress plugin tự fetch
            </p>
          </div>
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            {[
              { value: loading ? '...' : brandCount, label: 'Brands' },
              { value: loading ? '...' : totalBanners, label: 'Banners' },
              { value: loading ? '...' : activeBanners, label: 'Active' },
              { value: loading ? '...' : loginCount, label: 'Login URLs' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent)', lineHeight: 1.1 }}>
                  {value}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banners theo nhóm */}
        <div style={{ marginBottom: '20px' }}>
          <p style={sectionLabel}>Banners theo nhóm</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {GROUPS.map(g => {
              const count = data?.[`banners_${g}`]?.length || 0
              const color = GROUP_COLORS[g]
              return (
                <div key={g} style={{ ...card, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color }}>
                      {GROUP_LABELS[g].split(' ')[0]}
                    </span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>
                    {loading ? '...' : count}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>banners</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* API Endpoints */}
        <div style={{ marginBottom: '20px' }}>
          <p style={sectionLabel}>API Endpoints (WordPress)</p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {endpoints.map(({ label, path }, i) => (
              <div
                key={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderBottom: i < endpoints.length - 1 ? '1px solid var(--border)' : 'none',
                  gap: '12px',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '160px', flexShrink: 0 }}>
                  {label}
                </span>
                <code style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', flex: 1 }}>
                  {apiUrl}{path}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`${apiUrl}${path}`)}
                  style={{
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Hướng dẫn nhanh */}
        <div>
          <p style={sectionLabel}>Hướng dẫn nhanh</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {steps.map(({ step, title, desc }) => (
              <div key={step} style={{ ...card, padding: '14px', display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'var(--accent)',
                  color: 'white',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {step}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  )
}
