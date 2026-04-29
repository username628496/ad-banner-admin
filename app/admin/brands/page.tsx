'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { brandApi } from '@/lib/api'
import { Brand } from '@/lib/types'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'

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
      showMsg('Đã thêm nhà cái!')
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
    if (!confirm(`Xóa nhà cái "${id}"?`)) return
    const res = await brandApi.delete(id)
    if (!res.success) return showMsg(res.message || 'Lỗi!', true)
    showMsg('Đã xóa nhà cái!')
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
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '6px 10px',
    color: '#0F172A',
    fontSize: '13px',
    outline: 'none',
    ...extra,
  })

  return (
    <>
      <Header
        title="Nhà Cái"
        actions={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}
          >
            <Plus size={14} /> Thêm nhà cái
          </button>
        }
      />
      <main style={{ padding: '20px', flex: 1 }}>

        {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#DC2626' }}>⚠️ {error}</div>}
        {success && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#16A34A' }}>✅ {success}</div>}

        {showAddForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '3px', fontWeight: 500 }}>ID *</label>
                <input style={inp({ width: '110px' })} placeholder="net88"
                  value={addForm.id}
                  onChange={e => setAddForm({ ...addForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '3px', fontWeight: 500 }}>Tên *</label>
                <input style={inp({ width: '130px' })} placeholder="Net88"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '3px', fontWeight: 500 }}>Login URL</label>
                <input style={inp({ width: '200px' })} placeholder="https://net88.com/"
                  value={addForm.login_url}
                  onChange={e => setAddForm({ ...addForm, login_url: e.target.value })} />
              </div>
              <button onClick={createBrand} disabled={saving} style={{
                background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px',
                padding: '7px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button onClick={() => setShowAddForm(false)} style={{
                background: 'transparent', color: '#64748B',
                border: '1px solid #E2E8F0', borderRadius: '6px',
                padding: '7px 14px', fontSize: '13px', cursor: 'pointer',
              }}>Hủy</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Đang tải...</div>
        ) : brands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', fontSize: '14px' }}>
            Chưa có nhà cái nào. Click &quot;+ Thêm nhà cái&quot; để bắt đầu.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {brands.map(brand => (
              <div key={brand.id} style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '12px 16px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                opacity: brand.is_active ? 1 : 0.55,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <button
                    onClick={() => toggleActive(brand)}
                    title={brand.is_active ? 'Tắt' : 'Bật'}
                    style={{
                      width: '36px', height: '20px', borderRadius: '10px',
                      background: brand.is_active ? '#2563EB' : '#CBD5E1',
                      border: 'none', cursor: 'pointer', position: 'relative',
                      flexShrink: 0, transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '2px',
                      left: brand.is_active ? '18px' : '2px',
                      width: '16px', height: '16px',
                      background: 'white', borderRadius: '50%',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                  <code style={{ background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                    {brand.id}
                  </code>
                  <span style={{ fontWeight: 600, fontSize: '14px', flex: 1 }}>{brand.name}</span>
                  <button onClick={() => deleteBrand(brand.id)} style={{
                    background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px',
                    padding: '4px 10px', cursor: 'pointer', color: '#DC2626',
                    fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <Trash2 size={12} /> Xóa
                  </button>
                </div>

                {(['login_url'] as const).map(field => {
                  const label = 'Login:'
                  const val = brand[field]
                  const isEditing = editingField?.brandId === brand.id && editingField?.field === field
                  return (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8', minWidth: '68px', flexShrink: 0 }}>{label}</span>
                      {isEditing ? (
                        <>
                          <input
                            style={{ ...inp({ flex: '1', minWidth: 0 }) }}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveField(brand); if (e.key === 'Escape') setEditingField(null) }}
                            autoFocus
                          />
                          <button onClick={() => saveField(brand)} style={{ background: '#16A34A', color: 'white', border: 'none', borderRadius: '5px', padding: '4px 8px', cursor: 'pointer', flexShrink: 0 }}>
                            <Check size={12} />
                          </button>
                          <button onClick={() => setEditingField(null)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '5px', padding: '4px 8px', cursor: 'pointer', flexShrink: 0 }}>
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <a href={val} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {val || '—'}
                          </a>
                          <button onClick={() => startEditField(brand.id, field, val || '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px', flexShrink: 0 }}>
                            <Pencil size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
