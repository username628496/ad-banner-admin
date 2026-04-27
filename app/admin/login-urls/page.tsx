'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { loginUrlApi } from '@/lib/api'
import { LoginUrl } from '@/lib/types'
import { Plus, Trash2, Pencil, Check, X, Link2, Search } from 'lucide-react'

export default function LoginUrlsPage() {
  const [urls, setUrls] = useState<LoginUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ id: '', url: '' })
  const [form, setForm] = useState({ id: '', url: '' })
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const res = await loginUrlApi.getAll()
      if (res.success) setUrls(res.data || [])
      else throw new Error(res.message)
    } catch {
      showMsg('Không thể kết nối API!', true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const showMsg = (msg: string, isError = false) => {
    isError ? setError(msg) : setSuccess(msg)
    setTimeout(() => isError ? setError('') : setSuccess(''), 3000)
  }

  const create = async () => {
    if (!form.id || !form.url) return showMsg('Vui lòng nhập ID và URL!', true)
    setSaving(true)
    try {
      const res = await loginUrlApi.create(form)
      if (!res.success) throw new Error(res.message)
      setForm({ id: '', url: '' })
      showMsg('Đã thêm thành công!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi khi thêm!', true)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (url: LoginUrl) => {
    setEditingId(url.id)
    setEditForm({ id: url.id, url: url.url })
  }

  const saveEdit = async (oldId: string) => {
    if (!editForm.id || !editForm.url) return showMsg('ID và URL không được trống!', true)
    try {
      const res = await loginUrlApi.update(oldId, {
        url: editForm.url,
        newId: editForm.id !== oldId ? editForm.id : undefined,
      })
      if (!res.success) throw new Error(res.message)
      setEditingId(null)
      showMsg('Đã cập nhật!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi khi cập nhật!', true)
    }
  }

  const remove = async (id: string) => {
    if (!confirm(`Xóa "${id}"?`)) return
    try {
      const res = await loginUrlApi.delete(id)
      if (!res.success) throw new Error(res.message)
      showMsg('Đã xóa!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi khi xóa!', true)
    }
  }

  const filtered = urls.filter(u =>
    !search ||
    u.id.includes(search) ||
    u.url.toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle: React.CSSProperties = {
    background: '#F8FAFC',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 11px',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  }

  const btnBase: React.CSSProperties = {
    borderRadius: 'var(--radius-sm)',
    padding: '5px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    fontWeight: 500,
  }

  return (
    <>
      <Header title="Login URLs" />
      <main style={{ padding: '20px', flex: 1 }}>

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '13px',
            marginBottom: '14px',
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            background: 'var(--success-light)',
            border: '1px solid var(--success-border)',
            color: 'var(--success)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '13px',
            marginBottom: '14px',
          }}>
            {success}
          </div>
        )}

        {/* Add form card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          padding: '18px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Thêm Login URL</span>
            <Plus size={15} color="var(--accent)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                ID * <span style={{ fontWeight: 400 }}>(a-z, 0-9, -)</span>
              </label>
              <input
                style={inputStyle}
                placeholder="vd: zbet"
                value={form.id}
                onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                URL *
              </label>
              <input
                style={inputStyle}
                placeholder="https://zbet.fm/"
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && create()}
              />
            </div>
            <button
              onClick={create}
              disabled={saving}
              style={{
                ...btnBase,
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '7px 14px',
                fontSize: '13px',
                opacity: saving ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={14} />
              {saving ? 'Đang lưu...' : 'Thêm'}
            </button>
          </div>
        </div>

        {/* List card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {/* Card header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Danh sách</span>
              <span style={{
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                borderRadius: '20px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {urls.length}
              </span>
            </div>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search
                size={13}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                style={{ ...inputStyle, paddingLeft: '30px' }}
                placeholder="Tìm theo ID hoặc URL..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Đang tải...</div>
          ) : urls.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Link2 size={32} style={{ marginBottom: '10px', opacity: 0.25, display: 'block', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '14px', fontWeight: 500 }}>Chưa có URL nào.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '14px', fontWeight: 500 }}>Không tìm thấy kết quả</p>
              <p style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '4px' }}>Thử từ khóa khác</p>
            </div>
          ) : (
            <div>
              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {editingId === item.id ? (
                    <>
                      <input
                        style={{ ...inputStyle, width: '160px' }}
                        value={editForm.id}
                        onChange={e => setEditForm({ ...editForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        placeholder="ID"
                      />
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        value={editForm.url}
                        onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                        placeholder="URL"
                        onKeyDown={e => e.key === 'Enter' && saveEdit(item.id)}
                      />
                      <button
                        onClick={() => saveEdit(item.id)}
                        style={{
                          ...btnBase,
                          background: 'var(--success-light)',
                          border: '1px solid var(--success-border)',
                          color: 'var(--success)',
                        }}
                      >
                        <Check size={13} /> Lưu
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          ...btnBase,
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <X size={13} /> Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <code style={{
                        background: '#F1F5F9',
                        color: '#2563EB',
                        padding: '3px 9px',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '11px',
                        fontWeight: 500,
                        flexShrink: 0,
                      }}>
                        {item.id}
                      </code>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          fontSize: '13px',
                          color: 'var(--accent)',
                          textDecoration: 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.url}
                      </a>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          onClick={() => startEdit(item)}
                          style={{
                            ...btnBase,
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <Pencil size={12} /> Sửa
                        </button>
                        <button
                          onClick={() => remove(item.id)}
                          style={{
                            ...btnBase,
                            background: 'var(--danger-light)',
                            border: '1px solid var(--danger-border)',
                            color: 'var(--danger)',
                          }}
                        >
                          <Trash2 size={12} /> Xóa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  )
}
