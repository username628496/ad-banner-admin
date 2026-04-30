'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { brandApi } from '@/lib/api'
import { Brand } from '@/lib/types'
import { Plus, Trash2, Pencil, Check, X, AlertCircle, CheckCircle, Building2 } from 'lucide-react'

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ id: '', name: '', login_url: '' })
  const [saving, setSaving] = useState(false)
  const [editingField, setEditingField] = useState<{ brandId: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  const load = async () => {
    try {
      const res = await brandApi.getAll()
      if (res.success) setBrands(res.data || [])
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

  const createBrand = async () => {
    if (!addForm.id || !addForm.name) return showMsg('ID và tên là bắt buộc!', true)
    setSaving(true)
    try {
      const res = await brandApi.create(addForm)
      if (!res.success) throw new Error(res.message)
      setAddForm({ id: '', name: '', login_url: '' })
      setShowAddForm(false)
      showMsg('Brand đã được thêm!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi!', true)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (brand: Brand) => {
    await brandApi.update(brand.id, { is_active: !brand.is_active })
    load()
  }

  const deleteBrand = async (id: string) => {
    if (!confirm(`Xóa brand "${id}"?`)) return
    const res = await brandApi.delete(id)
    if (!res.success) return showMsg(res.message || 'Lỗi!', true)
    showMsg('Brand đã được xóa!')
    load()
  }

  const startEditField = (brandId: string, field: string, value: string) => {
    setEditingField({ brandId, field })
    setEditValue(value)
  }

  const saveField = async (brand: Brand) => {
    if (!editingField) return
    try {
      const update: any = {}
      update[editingField.field] = editValue
      const res = await brandApi.update(brand.id, update)
      if (!res.success) throw new Error(res.message)
      setEditingField(null)
      showMsg('Đã cập nhật!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi!', true)
    }
  }

  const inp = (extra: Record<string, any> = {}) => ({
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 10px',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
    ...extra,
  })

  const editInlineInput = {
    background: '#fff',
    border: '1px solid #93C5FD',
    borderRadius: 'var(--radius-sm)',
    padding: '5px 9px',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
    flex: 1,
    minWidth: 0,
    boxShadow: '0 0 0 3px rgba(37,99,235,0.1)',
  }

  return (
    <>
      <Header
        title="Brands"
        actions={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: showAddForm ? '#F1F5F9' : '#2563EB',
              color: showAddForm ? 'var(--text-secondary)' : 'white',
              border: showAddForm ? '1px solid var(--border)' : 'none',
              borderRadius: 'var(--radius-sm)', padding: '6px 14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '6px', fontSize: '13px', fontWeight: 500,
            }}
          >
            {showAddForm ? <X size={14} /> : <Plus size={14} />}
            {showAddForm ? 'Hủy' : 'Thêm brand'}
          </button>
        }
      />
      <main style={{ padding: '20px 24px', flex: 1, maxWidth: '860px' }}>

        {/* Alerts */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--danger-light)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--danger)' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}
        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--success-light)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--success)' }}>
            <CheckCircle size={14} style={{ flexShrink: 0 }} /> {success}
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '14px' }}>Brand mới</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>ID <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input style={inp({ width: '120px' })} placeholder="net88"
                  value={addForm.id}
                  onChange={e => setAddForm({ ...addForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  onKeyDown={e => e.key === 'Enter' && createBrand()} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Tên <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input style={inp({ width: '150px' })} placeholder="Net88"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && createBrand()} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Login URL</label>
                <input style={inp({ width: '240px' })} placeholder="https://net88.com/"
                  value={addForm.login_url}
                  onChange={e => setAddForm({ ...addForm, login_url: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && createBrand()} />
              </div>
              <button onClick={createBrand} disabled={saving} style={{
                background: '#2563EB', color: 'white', border: 'none',
                borderRadius: 'var(--radius-sm)', padding: '7px 18px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Check size={13} /> {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        )}

        {/* Brand List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontSize: '13px' }}>Đang tải...</div>
        ) : brands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <Building2 size={44} style={{ opacity: 0.2, marginBottom: '14px', display: 'block', margin: '0 auto 14px' }} />
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Chưa có brand nào</p>
            <p style={{ fontSize: '13px' }}>Click &ldquo;Thêm brand&rdquo; để bắt đầu</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {brands.map(brand => {
              const editingName = editingField?.brandId === brand.id && editingField?.field === 'name'
              const editingUrl = editingField?.brandId === brand.id && editingField?.field === 'login_url'

              return (
                <div
                  key={brand.id}
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid ${brand.is_active ? 'var(--border)' : '#E2E8F0'}`,
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'box-shadow 0.15s',
                    opacity: brand.is_active ? 1 : 0.5,
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => { if (brand.is_active) (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)' }}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'}
                >
                  {/* Card header */}
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Toggle */}
                    <button
                      onClick={() => toggleActive(brand)}
                      title={brand.is_active ? 'Đang bật — click để tắt' : 'Đang tắt — click để bật'}
                      style={{
                        width: '38px', height: '22px', borderRadius: '11px',
                        background: brand.is_active ? '#2563EB' : '#CBD5E1',
                        border: 'none', cursor: 'pointer', position: 'relative',
                        flexShrink: 0, transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '3px',
                        left: brand.is_active ? '19px' : '3px',
                        width: '16px', height: '16px',
                        background: 'white', borderRadius: '50%',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                      }} />
                    </button>

                    {/* ID badge */}
                    <code style={{
                      background: '#EFF6FF', color: '#2563EB',
                      padding: '3px 9px', borderRadius: '5px',
                      fontSize: '11px', fontWeight: 700, flexShrink: 0,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      {brand.id}
                    </code>

                    {/* Name (editable) */}
                    {editingName ? (
                      <div style={{ display: 'flex', gap: '6px', flex: 1, alignItems: 'center' }}>
                        <input
                          style={editInlineInput}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveField(brand); if (e.key === 'Escape') setEditingField(null) }}
                          autoFocus
                        />
                        <button onClick={() => saveField(brand)} style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 9px', cursor: 'pointer', flexShrink: 0 }}>
                          <Check size={12} />
                        </button>
                        <button onClick={() => setEditingField(null)} style={{ background: 'var(--bg-hover)', border: 'none', borderRadius: '5px', padding: '5px 9px', cursor: 'pointer', flexShrink: 0 }}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {brand.name}
                        </span>
                        <button
                          onClick={() => startEditField(brand.id, 'name', brand.name)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', flexShrink: 0, opacity: 0.6 }}
                          title="Sửa tên"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => deleteBrand(brand.id)}
                      style={{
                        background: 'none', border: '1px solid transparent', borderRadius: 'var(--radius-sm)',
                        padding: '5px 8px', cursor: 'pointer', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
                        flexShrink: 0, transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { const b = e.currentTarget; b.style.background = 'var(--danger-light)'; b.style.color = 'var(--danger)'; b.style.borderColor = 'var(--danger-border)' }}
                      onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'none'; b.style.color = 'var(--text-muted)'; b.style.borderColor = 'transparent' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* URL row */}
                  <div style={{ borderTop: '1px solid var(--border)', padding: '9px 16px', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0, width: '60px' }}>
                      Login URL
                    </span>
                    {editingUrl ? (
                      <>
                        <input
                          style={editInlineInput}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveField(brand); if (e.key === 'Escape') setEditingField(null) }}
                          autoFocus
                        />
                        <button onClick={() => saveField(brand)} style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 9px', cursor: 'pointer', flexShrink: 0 }}>
                          <Check size={12} />
                        </button>
                        <button onClick={() => setEditingField(null)} style={{ background: 'var(--bg-hover)', border: 'none', borderRadius: '5px', padding: '5px 9px', cursor: 'pointer', flexShrink: 0 }}>
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          href={brand.login_url} target="_blank" rel="noreferrer"
                          style={{ fontSize: '13px', color: '#2563EB', textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {brand.login_url || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có URL</span>}
                        </a>
                        <button
                          onClick={() => startEditField(brand.id, 'login_url', brand.login_url || '')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', flexShrink: 0 }}
                          title="Sửa URL"
                        >
                          <Pencil size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
