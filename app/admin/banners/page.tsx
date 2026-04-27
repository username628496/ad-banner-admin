'use client'
import { useEffect, useState, useRef } from 'react'
import Header from '@/components/Header'
import { bannerApi } from '@/lib/api'
import { Banner, Brand, GROUPS, GROUP_LABELS, GROUP_COLORS } from '@/lib/types'
import { Upload, Trash2, Pencil, Check, X, ToggleLeft, ToggleRight, Search, Plus, AlertTriangle, CheckCircle2, Image } from 'lucide-react'

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [brands, setBrands] = useState<Pick<Brand, 'id' | 'name'>[]>([])
  const [brandFilter, setBrandFilter] = useState('')
  const [activeGroup, setActiveGroup] = useState('slider')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ id: '', title: '', click_url: '', sort_order: 0 })
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ id: '', title: '', click_url: '', grp: 'slider' })

  const load = async () => {
    try {
      const res = await bannerApi.getAll()
      if (res.success) {
        const all: Banner[] = []
        GROUPS.forEach(g => {
          const items = res.data?.[`banners_${g}`] || []
          items.forEach((b: Banner) => all.push({ ...b, grp: g }))
        })
        setBanners(all)
        setBrands((res.data?.brands || []).map((b: any) => ({ id: b.id, name: b.name })))
      }
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
      ? setNewImagePreview(e.target?.result as string)
      : setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const upload = async () => {
    if (!form.id || !form.click_url || !fileRef.current?.files?.[0]) {
      return showMsg('Vui lòng điền ID, link và chọn ảnh!', true)
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('id', form.id)
      fd.append('grp', form.grp)
      fd.append('title', form.title)
      fd.append('click_url', form.click_url)
      fd.append('sort_order', String(banners.filter(b => b.grp === form.grp).length))
      fd.append('image', fileRef.current.files[0])
      const res = await bannerApi.create(fd)
      if (!res.success) throw new Error(res.message)
      setForm({ id: '', title: '', click_url: '', grp: activeGroup })
      setPreview(null)
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
    setEditForm({ id: b.id, title: b.title, click_url: b.click_url, sort_order: b.sort_order })
    setNewImagePreview(null)
  }

  const saveEdit = async (oldId: string) => {
    try {
      const res = await bannerApi.update(oldId, {
        newId: editForm.id !== oldId ? editForm.id : undefined,
        title: editForm.title,
        click_url: editForm.click_url,
        sort_order: editForm.sort_order,
      })
      if (!res.success) throw new Error(res.message)
      if (editFileRef.current?.files?.[0]) {
        const fd = new FormData()
        fd.append('image', editFileRef.current.files[0])
        await bannerApi.updateImage(editForm.id !== oldId ? editForm.id : oldId, fd)
      }
      setEditingId(null)
      setNewImagePreview(null)
      showMsg('Đã cập nhật!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi khi cập nhật!', true)
    }
  }

  const toggle = async (b: Banner) => {
    await bannerApi.update(b.id, { is_active: !b.is_active })
    load()
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
    .filter(b => !brandFilter || b.brand_id === brandFilter)
    .filter(b => !search || b.id.includes(search) || b.title.toLowerCase().includes(search.toLowerCase()) || b.click_url.includes(search))
    .sort((a, b) => a.sort_order - b.sort_order)

  const inp = (extra = {}) => ({
    background: '#F8FAFC',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 10px',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    ...extra
  })

  const btn = (color = 'var(--accent)', bg = 'var(--accent)', extra = {}) => ({
    background: bg, color,
    border: `1px solid ${bg === 'transparent' ? 'var(--border)' : bg}`,
    borderRadius: 'var(--radius-sm)',
    padding: '5px 10px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', fontWeight: 500,
    whiteSpace: 'nowrap' as const,
    ...extra
  })

  return (
    <>
      <Header
        title="Banners"
        actions={
          <button
            onClick={() => { setShowUpload(!showUpload); setForm({ ...form, grp: activeGroup }) }}
            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}
          >
            <Plus size={14} /> Upload Banner
          </button>
        }
      />
      <main style={{ padding: '20px', flex: 1 }}>

        {/* Alerts */}
        {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '7px' }}><AlertTriangle size={13} />{error}</div>}
        {success && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '7px' }}><CheckCircle2 size={13} />{success}</div>}

        {/* Upload Panel */}
        {showUpload && (
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '16px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={14} color="var(--accent)" /> Upload Banner mới
              </h3>
              <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>ID * <span style={{ fontWeight: 400 }}>(a-z, 0-9, -)</span></label>
                    <input style={inp()} placeholder="vd: zbet" value={form.id}
                      onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Group *</label>
                    <select style={{ ...inp(), cursor: 'pointer' }} value={form.grp} onChange={e => setForm({ ...form, grp: e.target.value })}>
                      {GROUPS.map(g => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Tiêu đề</label>
                  <input style={inp()} placeholder="vd: Zbet Banner" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Link khi click *</label>
                  <input style={inp()} placeholder="https://zbet.fm/" value={form.click_url} onChange={e => setForm({ ...form, click_url: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Ảnh Banner *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--accent)' : '#CBD5E1'}`,
                    borderRadius: 'var(--radius)', padding: '12px',
                    textAlign: 'center', cursor: 'pointer',
                    minHeight: '110px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: dragOver ? '#EFF6FF' : '#F8FAFC',
                    transition: 'all 0.15s',
                  }}
                >
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {preview
                    ? <img src={preview} style={{ maxWidth: '100%', maxHeight: '90px', borderRadius: '6px', objectFit: 'contain' }} />
                    : <><Upload size={20} color="#94A3B8" /><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click hoặc kéo thả ảnh</p><p style={{ fontSize: '11px', color: '#CBD5E1' }}>JPG, PNG, GIF, WebP — 5MB</p></>
                  }
                </div>
                <button onClick={upload} disabled={saving} style={{
                  marginTop: '8px', width: '100%', background: 'var(--accent)',
                  color: 'white', border: 'none', borderRadius: 'var(--radius-sm)',
                  padding: '9px', fontSize: '13px', fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}>
                  <Upload size={13} /> {saving ? 'Đang upload...' : 'Upload Banner'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Group Tabs + Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {GROUPS.map(g => {
              const count = banners.filter(b => b.grp === g).length
              const isActive = activeGroup === g
              const color = GROUP_COLORS[g]
              return (
                <button key={g} onClick={() => { setActiveGroup(g); setSearch('') }} style={{
                  background: isActive ? color : 'white',
                  border: `1px solid ${isActive ? color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', padding: '5px 12px',
                  cursor: 'pointer', color: isActive ? 'white' : 'var(--text-secondary)',
                  fontSize: '12px', fontWeight: isActive ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: '5px',
                  transition: 'all 0.1s', boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                }}>
                  {GROUP_LABELS[g]}
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-hover)',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    borderRadius: '20px', padding: '0 6px', fontSize: '11px', lineHeight: '18px'
                  }}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* Brand filter */}
          {brands.length > 0 && (
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              style={{ ...inp({ width: 'auto', cursor: 'pointer', paddingRight: '28px' }) }}
            >
              <option value="">Tất cả nhà cái</option>
              {brands.map(br => (
                <option key={br.id} value={br.id}>{br.name}</option>
              ))}
            </select>
          )}

          {/* Search */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              style={{ ...inp({ paddingLeft: '28px', width: '100%' }) }}
              placeholder="Tìm theo ID, tên, URL..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 90px 100px 90px 1fr 200px 80px 120px',
            gap: '0',
            padding: '8px 12px',
            background: '#F8FAFC',
            borderBottom: '1px solid var(--border)',
            fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.04em'
          }}>
            <div>#</div>
            <div>Ảnh</div>
            <div>ID</div>
            <div>Nhà Cái</div>
            <div>Tiêu đề / URL</div>
            <div>Click URL</div>
            <div style={{ textAlign: 'center' }}>Trạng thái</div>
            <div style={{ textAlign: 'right' }}>Thao tác</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <Image size={32} style={{ marginBottom: '8px', opacity: 0.25 }} />
              <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                {search ? 'Không tìm thấy kết quả' : `Chưa có banner trong ${GROUP_LABELS[activeGroup]}`}
              </p>
              <p style={{ fontSize: '12px', color: '#CBD5E1' }}>
                {search ? 'Thử từ khóa khác' : 'Click "Upload Banner" để thêm mới'}
              </p>
            </div>
          ) : (
            filtered.map((banner, idx) => (
              <div key={banner.id}>
                {editingId === banner.id ? (
                  // Edit row
                  <div style={{ padding: '12px', background: '#EFF6FF', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 80px', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontWeight: 600 }}>ID</label>
                        <input style={inp()} value={editForm.id}
                          onChange={e => setEditForm({ ...editForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Tiêu đề</label>
                        <input style={inp()} value={editForm.title}
                          onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Click URL</label>
                        <input style={inp()} value={editForm.click_url}
                          onChange={e => setEditForm({ ...editForm, click_url: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Order</label>
                        <input style={inp()} type="number" value={editForm.sort_order}
                          onChange={e => setEditForm({ ...editForm, sort_order: Number(e.target.value) })} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div onClick={() => editFileRef.current?.click()} style={{
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                        padding: '5px 10px', cursor: 'pointer', fontSize: '12px',
                        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px',
                        background: 'white'
                      }}>
                        <input ref={editFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], true)} />
                        <Upload size={12} /> Đổi ảnh
                        {newImagePreview && <img src={newImagePreview} style={{ height: '22px', borderRadius: '3px' }} />}
                      </div>
                      <div style={{ flex: 1 }} />
                      <button onClick={() => saveEdit(banner.id)} style={{ ...btn('white', '#16A34A') }}>
                        <Check size={12} /> Lưu
                      </button>
                      <button onClick={() => { setEditingId(null); setNewImagePreview(null) }}
                        style={{ ...btn('var(--text-secondary)', 'transparent') }}>
                        <X size={12} /> Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  // View row
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 90px 100px 90px 1fr 200px 80px 120px',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: banner.is_active ? 1 : 0.5,
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{banner.sort_order}</div>
                    <div>
                      <img src={banner.image_url} alt={banner.title}
                        style={{ width: '72px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)', display: 'block' }}
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/72x40/F1F5F9/94A3B8?text=IMG' }} />
                    </div>
                    <div>
                      <code style={{ fontSize: '11px', background: '#F1F5F9', color: '#2563EB', padding: '2px 6px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                        {banner.id}
                      </code>
                    </div>
                    <div>
                      {banner.brand_id ? (
                        <code style={{ fontSize: '11px', background: '#EFF6FF', color: '#2563EB', padding: '2px 6px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                          {banner.brand_id}
                        </code>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#CBD5E1' }}>—</span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{banner.title || '—'}</p>
                    </div>
                    <div>
                      <a href={banner.click_url} target="_blank" rel="noreferrer"
                        style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}>
                        {banner.click_url.length > 30 ? banner.click_url.substring(0, 30) + '...' : banner.click_url}
                      </a>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <button onClick={() => toggle(banner)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        {banner.is_active
                          ? <ToggleRight size={22} color="#16A34A" />
                          : <ToggleLeft size={22} color="#CBD5E1" />
                        }
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <button onClick={() => startEdit(banner)} style={{ ...btn('var(--text-secondary)', 'transparent') }}>
                        <Pencil size={11} /> Sửa
                      </button>
                      <button onClick={() => remove(banner.id)} style={{ ...btn('#DC2626', '#FEF2F2', { border: '1px solid #FECACA' }) }}>
                        <Trash2 size={11} /> Xóa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Footer */}
          {filtered.length > 0 && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', background: '#F8FAFC', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{filtered.length} banner{search ? ` (lọc từ ${banners.filter(b => b.grp === activeGroup).length})` : ''}</span>
              <span style={{ color: GROUP_COLORS[activeGroup], fontWeight: 500 }}>{GROUP_LABELS[activeGroup]}</span>
            </div>
          )}
        </div>
      </main>
    </>
  )
}