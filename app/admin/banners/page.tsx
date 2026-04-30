'use client'
import { useEffect, useState, useRef } from 'react'
import Header from '@/components/Header'
import { bannerApi, brandApi } from '@/lib/api'
import { Banner, Brand, GROUPS, GROUP_LABELS, GROUP_COLORS } from '@/lib/types'
import { Upload, Trash2, Pencil, Check, X, Search, Plus, AlertCircle, CheckCircle, Image as ImageIcon, ZoomIn } from 'lucide-react'

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

  const [lightbox, setLightbox] = useState<string | null>(null)

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

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox])

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
    showMsg('Đã xóa banner!')
    load()
  }

  const filtered = banners
    .filter(b => b.grp === activeGroup)
    .filter(b => !search || b.id.includes(search) || (b.brand_id || '').includes(search))
    .sort((a, b) => a.sort_order - b.sort_order)

  const inp = (extra: Record<string, any> = {}) => ({
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 10px',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    ...extra,
  })

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.93)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'rgba(255,255,255,0.12)', border: 'none',
              borderRadius: '50%', width: '40px', height: '40px',
              cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
          <img
            src={lightbox}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              objectFit: 'contain', borderRadius: '8px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
            alt="Preview"
          />
        </div>
      )}

      <Header
        title="Banners"
        actions={
          <button
            onClick={() => { setShowUpload(!showUpload); setForm(f => ({ ...f, grp: activeGroup })) }}
            style={{
              background: showUpload ? '#F1F5F9' : '#2563EB',
              color: showUpload ? 'var(--text-secondary)' : 'white',
              border: showUpload ? '1px solid var(--border)' : 'none',
              borderRadius: 'var(--radius-sm)', padding: '6px 14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '6px', fontSize: '13px', fontWeight: 500,
            }}
          >
            {showUpload ? <X size={14} /> : <Plus size={14} />}
            {showUpload ? 'Hủy' : 'Upload Banner'}
          </button>
        }
      />
      <main style={{ padding: '20px 24px', flex: 1 }}>

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

        {/* Upload Panel */}
        {showUpload && (
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: '20px', boxShadow: 'var(--shadow)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Upload size={14} color="var(--accent)" /> Upload Banner mới
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left: fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 500 }}>ID <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input style={inp()} placeholder="net88-homepage"
                      value={form.id}
                      onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 500 }}>Group <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select style={{ ...inp(), cursor: 'pointer' }} value={form.grp}
                      onChange={e => setForm({ ...form, grp: e.target.value })}>
                      {GROUPS.map(g => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 500 }}>Brand</label>
                  <select style={{ ...inp(), cursor: 'pointer' }} value={form.brand_id}
                    onChange={e => setForm({ ...form, brand_id: e.target.value })}>
                    <option value="">— Không gắn brand —</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name} ({b.id})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px', fontWeight: 500 }}>Click URL <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input style={inp()} placeholder="https://net88.com/"
                    value={form.click_url}
                    onChange={e => setForm({ ...form, click_url: e.target.value })} />
                </div>
              </div>

              {/* Right: image upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Ảnh <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  style={{
                    flex: 1,
                    border: `2px dashed ${dragOver ? '#2563EB' : '#CBD5E1'}`,
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: dragOver ? '#EFF6FF' : 'var(--bg)',
                    transition: 'all 0.15s',
                    minHeight: '120px',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {uploadPreview ? (
                    <img src={uploadPreview} style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '6px' }} alt="preview" />
                  ) : (
                    <>
                      <Upload size={22} color="#CBD5E1" />
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Click hoặc kéo thả ảnh<br />
                        <span style={{ fontSize: '11px', color: '#CBD5E1' }}>PNG, JPG, WebP...</span>
                      </p>
                    </>
                  )}
                </div>
                <button onClick={upload} disabled={saving} style={{
                  background: '#2563EB', color: 'white', border: 'none',
                  borderRadius: 'var(--radius-sm)', padding: '9px',
                  fontSize: '13px', fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                }}>
                  <Upload size={13} /> {saving ? 'Đang upload...' : 'Upload Banner'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs + Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {GROUPS.map(g => {
              const count = banners.filter(b => b.grp === g).length
              const isActive = activeGroup === g
              const color = GROUP_COLORS[g]
              return (
                <button key={g} onClick={() => { setActiveGroup(g); setSearch(''); setEditingId(null) }} style={{
                  background: isActive ? color : '#FFFFFF',
                  border: `1px solid ${isActive ? color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', padding: '6px 14px',
                  cursor: 'pointer', color: isActive ? 'white' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: isActive ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.12s',
                  boxShadow: isActive ? `0 2px 6px ${color}40` : 'none',
                }}>
                  {GROUP_LABELS[g]}
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg)',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    borderRadius: '20px', padding: '1px 7px', fontSize: '11px', lineHeight: '16px', fontWeight: 600,
                  }}>{count}</span>
                </button>
              )
            })}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '7px 10px 7px 30px', color: 'var(--text)', fontSize: '13px', outline: 'none', width: '230px' }}
              placeholder="Tìm theo ID hoặc brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Edit Panel */}
        {editingId && (() => {
          return (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Pencil size={13} color="#2563EB" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1D4ED8' }}>Sửa banner:</span>
                <code style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>{editingId}</code>
                <button onClick={() => { setEditingId(null); setEditPreview(null) }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>ID</label>
                  <input style={{ background: '#fff', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-sm)', padding: '7px 10px', color: 'var(--text)', fontSize: '13px', outline: 'none', width: '100%' }} value={editForm.id}
                    onChange={e => setEditForm({ ...editForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Click URL</label>
                  <input style={{ background: '#fff', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-sm)', padding: '7px 10px', color: 'var(--text)', fontSize: '13px', outline: 'none', width: '100%' }} value={editForm.click_url}
                    onChange={e => setEditForm({ ...editForm, click_url: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Brand</label>
                  <select style={{ background: '#fff', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-sm)', padding: '7px 10px', color: 'var(--text)', fontSize: '13px', outline: 'none', width: '100%', cursor: 'pointer' }} value={editForm.brand_id}
                    onChange={e => setEditForm({ ...editForm, brand_id: e.target.value })}>
                    <option value="">— Không —</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Sort</label>
                  <input style={{ background: '#fff', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-sm)', padding: '7px 10px', color: 'var(--text)', fontSize: '13px', outline: 'none', width: '100%' }} type="number" value={editForm.sort_order}
                    onChange={e => setEditForm({ ...editForm, sort_order: Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div onClick={() => editFileRef.current?.click()} style={{
                  border: '1px solid #BFDBFE', borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px', cursor: 'pointer', fontSize: '12px',
                  color: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'white',
                }}>
                  <input ref={editFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], true)} />
                  <Upload size={12} /> Đổi ảnh
                  {editPreview && <img src={editPreview} style={{ height: '24px', borderRadius: '3px' }} alt="preview" />}
                </div>
                <div style={{ flex: 1 }} />
                <button onClick={() => saveEdit(editingId)} style={{
                  background: 'var(--success)', color: 'white', border: 'none',
                  borderRadius: 'var(--radius-sm)', padding: '7px 16px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  <Check size={13} /> Lưu
                </button>
              </div>
            </div>
          )
        })()}

        {/* Banner Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontSize: '13px' }}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <ImageIcon size={44} style={{ opacity: 0.2, marginBottom: '14px', display: 'block', margin: '0 auto 14px' }} />
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {search ? 'Không tìm thấy kết quả' : `Chưa có banner trong ${GROUP_LABELS[activeGroup]}`}
            </p>
            <p style={{ fontSize: '13px' }}>
              {search ? 'Thử từ khóa khác' : 'Click "Upload Banner" để thêm mới'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px',
          }}>
            {filtered.map(banner => (
              <div
                key={banner.id}
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${editingId === banner.id ? '#93C5FD' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'box-shadow 0.15s, transform 0.1s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'var(--shadow-md)'; el.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'var(--shadow-sm)'; el.style.transform = 'translateY(0)' }}
              >
                {/* Image area */}
                <div
                  style={{ position: 'relative', paddingTop: '56.25%', background: '#0f172a', cursor: 'zoom-in' }}
                  onClick={() => setLightbox(banner.image_url)}
                >
                  <img
                    src={banner.image_url}
                    alt={banner.id}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {/* Hover overlay */}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      opacity: 0, transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={e => { e.stopPropagation(); setLightbox(banner.image_url) }}
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}
                    >
                      <ZoomIn size={11} /> Xem
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); startEdit(banner) }}
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}
                    >
                      <Pencil size={11} /> Sửa
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); remove(banner.id) }}
                      style={{ background: 'rgba(220,38,38,0.7)', color: 'white', border: '1px solid rgba(220,38,38,0.5)', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={11} /> Xóa
                    </button>
                  </div>
                </div>

                {/* Card info */}
                <div style={{ padding: '10px 12px' }}>
                  <code style={{ display: 'block', fontSize: '11px', color: '#2563EB', fontFamily: 'JetBrains Mono, monospace', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {banner.id}
                  </code>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    {banner.brand_id
                      ? <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>
                          {banner.brand_id}
                        </span>
                      : <span style={{ fontSize: '11px', color: '#CBD5E1' }}>—</span>
                    }
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => startEdit(banner)}
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '5px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Pencil size={11} /> Sửa
                      </button>
                      <button
                        onClick={() => remove(banner.id)}
                        style={{ background: 'var(--danger-light)', border: '1px solid var(--danger-border)', borderRadius: '5px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Trash2 size={11} /> Xóa
                      </button>
                    </div>
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
