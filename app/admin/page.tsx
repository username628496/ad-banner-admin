'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { bannerApi, loginUrlApi } from '@/lib/api'
import { GROUPS, GROUP_LABELS, GROUP_COLORS } from '@/lib/types'
import { Link2, Image, Zap, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loginCount, setLoginCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [allRes, loginRes] = await Promise.all([
          bannerApi.getAll(),
          loginUrlApi.getAll()
        ])
        if (allRes.success) setData(allRes.data)
        if (loginRes.success) setLoginCount(loginRes.data?.length || 0)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalBanners = GROUPS.reduce((sum, g) =>
    sum + (data?.[`banners_${g}`]?.length || 0), 0)

  return (
    <>
      <Header title="Dashboard" />
      <main style={{ padding: '24px', flex: 1 }}>

        {/* Welcome */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 100%)',
          border: '1px solid #3730a3', borderRadius: '14px',
          padding: '24px 28px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: 'white' }}>
              Ad Banner System v4.0 👋
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '13px' }}>
              Quản lý banner tập trung — WordPress plugin tự động fetch và hiển thị.
            </p>
          </div>
          <div style={{
            width: '56px', height: '56px',
            background: 'rgba(99,102,241,0.2)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={26} color="#6366f1" />
          </div>
        </div>

        {/* Top stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Login URLs', value: loginCount, icon: Link2, color: '#6366f1' },
            { label: 'Tổng Banners', value: totalBanners, icon: Image, color: '#10b981' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color }}>
                  {loading ? '...' : value}
                </p>
              </div>
              <div style={{
                width: '40px', height: '40px',
                background: `${color}20`, borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={18} color={color} />
              </div>
            </div>
          ))}
        </div>

        {/* Banners by group */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {GROUPS.map(grp => {
            const count = data?.[`banners_${grp}`]?.length || 0
            const color = GROUP_COLORS[grp]
            return (
              <div key={grp} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '16px',
              }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {GROUP_LABELS[grp]}
                </p>
                <p style={{ fontSize: '24px', fontWeight: 700, color }}>
                  {loading ? '...' : count}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>banners</p>
              </div>
            )
          })}
        </div>

        {/* Quick Guide */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={15} color="var(--accent)" /> Hướng dẫn nhanh
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { step: '01', title: 'Thêm Nhà Cái', desc: 'Vào Nhà Cái → Thêm brand (Net88, Gem88...)' },
              { step: '02', title: 'Upload Banner', desc: 'Mỗi nhà cái upload banner cho 3 vị trí: Homepage, Catfish, Sidebar' },
              { step: '03', title: 'Cài WordPress Plugin', desc: 'Cài plugin → Nhập CDN URL riêng mỗi site → Nhập tracking param' },
              { step: '04', title: 'Dùng Shortcode', desc: '[banner_homepage] [banner_catfish] [banner_sidebar]' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '12px', borderRadius: '8px',
                background: 'var(--bg-hover)', border: '1px solid var(--border)'
              }}>
                <div style={{
                  minWidth: '28px', height: '28px', background: 'var(--accent)',
                  borderRadius: '6px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white'
                }}>{step}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}