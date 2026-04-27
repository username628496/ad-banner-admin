'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiUrl, setApiUrl] = useState('https://motorshow.uk.com')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('api_url')
    if (stored) setApiUrl(stored)
    inputRef.current?.focus()
  }, [])

  const handleLogin = async () => {
    if (!password) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Sai mật khẩu!')

      const token = data.token
      localStorage.setItem('admin_token', token)
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `admin_token=${token}; expires=${expires}; path=/`

      router.push('/admin')
    } catch (e: any) {
      setError(e.message || 'Đăng nhập thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '40px 36px',
        width: '380px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
            Ad Banner
          </h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 400 }}>
            Admin Panel
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#DC2626',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '6px',
          }}>
            Mật khẩu
          </label>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Nhập mật khẩu..."
            style={{
              width: '100%',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '14px',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !password}
          style={{
            width: '100%',
            background: loading || !password ? '#93C5FD' : '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '11px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading || !password ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </div>
    </div>
  )
}
