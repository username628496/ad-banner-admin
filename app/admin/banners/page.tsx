'use client'
import { useEffect, useState, useRef } from 'react'
import Header from '@/components/Header'
import { bannerApi, brandApi } from '@/lib/api'
import { Banner, Brand, GROUPS, GROUP_LABELS, GROUP_COLORS } from '@/lib/types'
import { Upload, Trash2, Pencil, Check, X, Search, Plus } from 'lucide-react'

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [activeGroup, setActiveGroup] = useState('homepage')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [form, setForm] = useState({ id: '', grp: 'homepage', brand_id: '', click_url: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ id: '', click_url: '', brand_id: '', sort_order: 0 })
  const [editPreview, setEditPreview] = useState<string | null>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      const [bannersRes, brandsRes] = await Promise.all([
        bannerApi.getAll(),
        brandApi.getAll(),
      ])
      if (bannersRes.success) {
        const all: Banner[] = []
        GROUPS.forEach(g => {
          const items = bannersRes.data?.[`banners_${g}`] || []
          items.forEach((b: Banner) => all.push({ ...b, grp: g }))
        })
        setBanners(all)
      }
      if (brandsRes.success) setBrands(brandsRes.data || [])
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

  const handleFile = (file: File, isEdit = false) => {
    const reader = new FileReader()
    reader.onload = e => isEdit
      ? setEditPreview(e.target?.result as string)
      : setUploadPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const upload = async () => {
  console.log('form.id:', form.id)
  console.log('form.click_url:', form.click_url)
  console.log('fileRef:', fileRef.current)
  console.log('files:', fileRef.current?.files)
  console.log('file[0]:', fileRef.current?.files?.[0])
  
  if (!form.id || !form.click_url || !fileRef.current?.files?.[0]) {
    return showMsg('Vui lòng điền ID, link và chọn ảnh!', true)
  }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('id', form.id)
      fd.append('grp', form.grp)
      if (form.brand_id) fd.append('brand_id', form.brand_id)
      fd.append('click_url', form.click_url)
      fd.append('sort_order', String(banners.filter(b => b.grp === form.grp).length))
      fd.append('image', fileRef.current.files[0])
      const res = await bannerApi.create(fd)
      if (!res.success) throw new Error(res.message)
      setForm({ id: '', grp: activeGroup, brand_id: '', click_url: '' })
      setUploadPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      setShowUpload(false)
      setActiveGroup(form.grp)
      showMsg('Đã upload banner!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi khi upload!', true)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (b: Banner) => {
    setEditingId(b.id)
    setEditForm({ id: b.id, click_url: b.click_url, brand_id: b.brand_id || '', sort_order: b.sort_order })
    setEditPreview(null)
    if (editFileRef.current) editFileRef.current.value = ''
  }

  const saveEdit = async (oldId: string) => {
    try {
      const res = await bannerApi.update(oldId, {
        newId: editForm.id !== oldId ? editForm.id : undefined,
        click_url: editForm.click_url,
        brand_id: editForm.brand_id || null,
        sort_order: editForm.sort_order,
      })
      if (!res.success) throw new Error(res.message)
      if (editFileRef.current?.files?.[0]) {
        const fd = new FormData()
        fd.append('image', editFileRef.current.files[0])
        await bannerApi.updateImage(editForm.id !== oldId ? editForm.id : oldId, fd)
      }
      setEditingId(null)
      setEditPreview(null)
      showMsg('Đã cập nhật!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi khi cập nhật!', true)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Xóa banner này?')) return
    const res = await bannerApi.delete(id)
    if (!res.success) return showMsg(res.message || 'Lỗi!', true)
    showMsg('Đã xóa!')
    load()
  }

  const filtered = banners
    .filter(b => b.grp === activeGroup)
    .filter(b => !search || b.id.includes(search) || (b.brand_id || '').includes(search))
    .sort((a, b) => a.sort_order - b.sort_order)

  const inp = (extra: Record<string, any> = {}) => ({
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '6px 10px',
    color: '#0F172A',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    ...extra,
  })

  return (
    <>
      <Header
        title="Banners"
        actions={
          <button
            onClick={() => { setShowUpload(!showUpload); setForm(f => ({ ...f, grp: activeGroup })) }}
            style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}
          >
            <Plus size={14} /> Upload Banner
          </button>
        }
      />
      <main style={{ padding: '20px', flex: 1 }}>

        {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#DC2626' }}>⚠️ {error}</div>}
        {success && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#16A34A' }}>✅ {success}</div>}

        {/* Upload Panel */}
        {showUpload && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Upload Banner mới</h3>
              <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px', fontWeight: 500 }}>ID * (a-z, 0-9, -)</label>
                    <input style={inp()} placeholder="net88-homepage"
                      value={form.id}
                      onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Group *</label>
                    <select style={{ ...inp(), cursor: 'pointer' }} value={form.grp}
                      onChange={e => setForm({ ...form, grp: e.target.value })}>
                      {GROUPS.map(g => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Nhà Cái (tuỳ chọn)</label>
                  <select style={{ ...inp(), cursor: 'pointer' }} value={form.brand_id}
                    onChange={e => setForm({ ...form, brand_id: e.target.value })}>
                    <option value="">— Không gắn nhà cái —</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name} ({b.id})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Click URL *</label>
                  <input style={inp()} placeholder="https://net88.com/"
                    value={form.click_url}
                    onChange={e => setForm({ ...form, click_url: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Ảnh Banner *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  style={{
                    border: `2px dashed ${dragOver ? '#2563EB' : '#CBD5E1'}`,
                    borderRadius: '8px', padding: '12px',
                    textAlign: 'center', cursor: 'pointer',
                    minHeight: '110px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: dragOver ? '#EFF6FF' : '#F8FAFC',
                    transition: 'all 0.15s',
                  }}
                >
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {uploadPreview
                    ? <img src={uploadPreview} style={{ maxWidth: '100%', maxHeight: '90px', borderRadius: '6px', objectFit: 'contain' }} alt="preview" />
                    : <><Upload size={20} color="#94A3B8" /><p style={{ fontSize: '12px', color: '#94A3B8' }}>Click hoặc kéo thả ảnh</p></>
                  }
                </div>
                <button onClick={upload} disabled={saving} style={{
                  marginTop: '8px', width: '100%', background: '#2563EB',
                  color: 'white', border: 'none', borderRadius: '6px',
                  padding: '9px', fontSize: '13px', fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                  <Upload size={13} /> {saving ? 'Đang upload...' : 'Upload Banner'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs + Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {GROUPS.map(g => {
              const count = banners.filter(b => b.grp === g).length
              const isActive = activeGroup === g
              const color = GROUP_COLORS[g]
              return (
                <button key={g} onClick={() => { setActiveGroup(g); setSearch(''); setEditingId(null) }} style={{
                  background: isActive ? color : 'white',
                  border: `1px solid ${isActive ? color : '#E2E8F0'}`,
                  borderRadius: '6px', padding: '5px 12px',
                  cursor: 'pointer', color: isActive ? 'white' : '#64748B',
                  fontSize: '12px', fontWeight: isActive ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: '5px',
                  transition: 'all 0.1s',
                }}>
                  {GROUP_LABELS[g]}
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                    color: isActive ? 'white' : '#94A3B8',
                    borderRadius: '20px', padding: '0 6px', fontSize: '11px', lineHeight: '18px',
                  }}>{count}</span>
                </button>
              )
            })}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px 6px 28px', color: '#0F172A', fontSize: '13px', outline: 'none', width: '220px' }}
              placeholder="Tìm theo ID hoặc nhà cái..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Edit Panel */}
        {editingId && (() => {
          const banner = banners.find(b => b.id === editingId)
          if (!banner) return null
          return (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px', fontWeight: 500 }}>
                <Pencil size={13} color="#2563EB" />
                Sửa: <code style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '1px 6px', borderRadius: '4px', fontSize: '12px' }}>{editingId}</code>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#64748B', display: 'block', marginBottom: '3px', fontWeight: 600 }}>ID</label>
                  <input style={inp()} value={editForm.id}
                    onChange={e => setEditForm({ ...editForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#64748B', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Click URL</label>
                  <input style={inp()} value={editForm.click_url}
                    onChange={e => setEditForm({ ...editForm, click_url: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#64748B', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Nhà Cái</label>
                  <select style={{ ...inp(), cursor: 'pointer' }} value={editForm.brand_id}
                    onChange={e => setEditForm({ ...editForm, brand_id: e.target.value })}>
                    <option value="">— Không —</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#64748B', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Sort Order</label>
                  <input style={inp()} type="number" value={editForm.sort_order}
                    onChange={e => setEditForm({ ...editForm, sort_order: Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div onClick={() => editFileRef.current?.click()} style={{
                  border: '1px solid #E2E8F0', borderRadius: '6px',
                  padding: '5px 10px', cursor: 'pointer', fontSize: '12px',
                  color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'white',
                }}>
                  <input ref={editFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], true)} />
                  <Upload size={12} /> Đổi ảnh
                  {editPreview && <img src={editPreview} style={{ height: '22px', borderRadius: '3px' }} alt="preview" />}
                </div>
                <div style={{ flex: 1 }} />
                <button onClick={() => saveEdit(editingId)} style={{
                  background: '#16A34A', color: 'white', border: 'none', borderRadius: '6px',
                  padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <Check size={12} /> Lưu
                </button>
                <button onClick={() => { setEditingId(null); setEditPreview(null) }} style={{
                  background: 'white', border: '1px solid #E2E8F0', borderRadius: '6px',
                  padding: '6px 14px', cursor: 'pointer', fontSize: '12px', color: '#64748B',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <X size={12} /> Hủy
                </button>
              </div>
            </div>
          )
        })()}

        {/* Banner Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
              {search ? 'Không tìm thấy kết quả' : `Chưa có banner trong ${GROUP_LABELS[activeGroup]}`}
            </p>
            <p style={{ fontSize: '12px', color: '#CBD5E1' }}>
              {search ? 'Thử từ khóa khác' : 'Click "Upload Banner" để thêm mới'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px',
          }}>
            {filtered.map(banner => (
              <div key={banner.id} style={{
                background: '#FFFFFF',
                border: `1px solid ${editingId === banner.id ? '#93C5FD' : '#E2E8F0'}`,
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                {/* 16:9 image */}
                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#F1F5F9' }}>
                  <img
                    src={banner.image_url}
                    alt={banner.id}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/320x180/F1F5F9/94A3B8?text=IMG' }}
                  />
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.55)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      opacity: 0, transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                  >
                    <button onClick={() => startEdit(banner)} style={{
                      background: 'white', color: '#0F172A', border: 'none',
                      borderRadius: '6px', padding: '5px 10px', cursor: 'pointer',
                      fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500,
                    }}>
                      <Pencil size={11} /> Sửa
                    </button>
                    <button onClick={() => remove(banner.id)} style={{
                      background: '#DC2626', color: 'white', border: 'none',
                      borderRadius: '6px', padding: '5px 10px', cursor: 'pointer',
                      fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500,
                    }}>
                      <Trash2 size={11} /> Xóa
                    </button>
                  </div>
                </div>

                {/* Card info */}
                <div style={{ padding: '8px 10px' }}>
                  <code style={{ display: 'block', fontSize: '11px', color: '#2563EB', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {banner.id}
                  </code>
                  {banner.brand_id
                    ? <span style={{ display: 'inline-block', background: '#EFF6FF', color: '#2563EB', padding: '1px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>
                        {banner.brand_id}
                      </span>
                    : <span style={{ fontSize: '11px', color: '#CBD5E1' }}>—</span>
                  }
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    <button onClick={() => startEdit(banner)} style={{
                      flex: 1, background: 'transparent', border: '1px solid #E2E8F0',
                      borderRadius: '5px', padding: '4px 0', cursor: 'pointer',
                      fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    }}>
                      <Pencil size={11} /> Sửa
                    </button>
                    <button onClick={() => remove(banner.id)} style={{
                      flex: 1, background: '#FEF2F2', border: '1px solid #FECACA',
                      borderRadius: '5px', padding: '4px 0', cursor: 'pointer',
                      fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    }}>
                      <Trash2 size={11} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
