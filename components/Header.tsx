'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Check, X, LogOut } from 'lucide-react'

export default function Header({ title, actions }: {
  title: string
  actions?: React.ReactNode
}) {
  const [token, setToken] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [saved, setSaved] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setToken(localStorage.getItem('admin_token') || 'your-secret-token-123')
    setApiUrl(localStorage.getItem('api_url') || 'http://localhost:3000')
  }, [])

  const logout = () => {
    localStorage.removeItem('admin_token')
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    router.push('/login')
  }

  const save = () => {
    localStorage.setItem('admin_token', token)
    localStorage.setItem('api_url', apiUrl)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setShowSettings(false)
      window.location.reload()
    }, 1000)
  }

  const inputStyle: React.CSSProperties = {
    background: '#F8FAFC',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 11px',
    fontSize: '13px',
    color: 'var(--text)',
    outline: 'none',
    width: '100%',
  }

  return (
    <header style={{
      height: '52px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      background: '#FFFFFF',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <h1 style={{
        fontSize: '15px',
        fontWeight: 600,
        color: 'var(--text)',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {actions}

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            color: '#DC2626',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-sm)',
            padding: '5px 9px',
            cursor: 'pointer',
            background: 'transparent',
          }}
        >
          <LogOut size={13} /> Đăng xuất
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 9px',
              cursor: 'pointer',
              background: showSettings ? 'var(--bg-hover)' : 'transparent',
            }}
          >
            <Settings size={13} /> Cài đặt
          </button>

          {showSettings && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: 0,
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-md)',
              padding: '16px',
              width: '300px',
              zIndex: 100,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Kết nối API</p>
                <button
                  onClick={() => setShowSettings(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '2px' }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    API URL
                  </label>
                  <input
                    style={inputStyle}
                    value={apiUrl}
                    onChange={e => setApiUrl(e.target.value)}
                    placeholder="http://localhost:3000"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Admin Token
                  </label>
                  <input
                    type="password"
                    style={inputStyle}
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Token..."
                  />
                </div>

                <button
                  onClick={save}
                  style={{
                    background: saved ? 'var(--success)' : 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '7px 14px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    width: '100%',
                  }}
                >
                  {saved ? <><Check size={13} /> Đã lưu!</> : 'Lưu & Reload'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
