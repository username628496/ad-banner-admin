'use client'
import { useEffect, useState, useRef } from 'react'
import Header from '@/components/Header'
import { brandApi, bannerApi } from '@/lib/api'
import { Brand, GROUPS, GROUP_COLORS } from '@/lib/types'
import {
  Plus, Trash2, Pencil, Check, X,
  ChevronDown, ChevronUp, Upload, Globe, Search, Building2
} from 'lucide-react'

const GROUP_SHORT: Record<string, string> = {
  slider: 'Slider', homepage: 'Homepage', catfish: 'Catfish', sidebar: 'Sidebar', popup: 'Popup',
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ id: '', name: '', login_url: '', register_url: '' })
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null)
  const [editBrandForm, setEditBrandForm] = useState({ name: '' })
  const [changingUrlBrandId, setChangingUrlBrandId] = useState<string | null>(null)
  const [changeUrlForm, setChangeUrlForm] = useState({ login_url: '', register_url: '' })
  const [uploadSlot, setUploadSlot] = useState<{ brandId: string; grp: string } | null>(null)
  const [uploadForm, setUploadForm] = useState({ id: '', click_url: '' })
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [hoverBannerId, setHoverBannerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [filterText, setFilterText] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

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

  const getBannerCount = (brand: Brand) =>
    GROUPS.reduce((n, g) => n + (brand.banners?.[g] ? 1 : 0), 0)

  const handleAdd = async () => {
    if (!addForm.id || !addForm.name) return showMsg('ID và Tên là bắt buộc!', true)
    setSaving(true)
    try {
      const res = await brandApi.create(addForm)
      if (!res.success) throw new Error(res.message)
      setAddForm({ id: '', name: '', login_url: '', register_url: '' })
      setShowAddForm(false)
      showMsg('Đã thêm nhà cái!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi khi thêm!', true)
    } finally {
      setSaving(false)
    }
  }

  const toggleBrand = async (brand: Brand) => {
    try {
      await brandApi.update(brand.id, { is_active: !brand.is_active })
      load()
    } catch {
      showMsg('Lỗi cập nhật trạng thái!', true)
    }
  }

  const deleteBrand = async (id: string, name: string) => {
    if (!confirm(`Xóa nhà cái "${name}"? Hành động này không thể hoàn tác.`)) return
    try {
      const res = await brandApi.delete(id)
      if (!res.success) throw new Error(res.message)
      if (expandedId === id) setExpandedId(null)
      showMsg('Đã xóa nhà cái!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi khi xóa!', true)
    }
  }

  const saveBrandName = async (id: string) => {
    if (!editBrandForm.name.trim()) return showMsg('Tên không được trống!', true)
    try {
      const res = await brandApi.update(id, { name: editBrandForm.name.trim() })
      if (!res.success) throw new Error(res.message)
      setEditingBrandId(null)
      showMsg('Đã cập nhật tên!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi!', true)
    }
  }

  const saveChangeUrl = async (brand: Brand) => {
    try {
      const res = await brandApi.update(brand.id, {
        login_url: changeUrlForm.login_url.trim(),
        register_url: changeUrlForm.register_url.trim(),
      })
      if (!res.success) throw new Error(res.message)
      setChangingUrlBrandId(null)
      const count = getBannerCount(brand)
      showMsg(`Đã cập nhật URL${count > 0 ? ` — ${count} banner tự cập nhật` : ''}!`)
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi!', true)
    }
  }

  const deleteBanner = async (bannerId: string) => {
    try {
      const res = await bannerApi.delete(bannerId)
      if (!res.success) throw new Error(res.message)
      setHoverBannerId(null)
      showMsg('Đã xóa banner!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi khi xóa banner!', true)
    }
  }

  const handleUpload = async (brand: Brand) => {
    if (!uploadSlot) return
    if (!uploadForm.id || !fileRef.current?.files?.[0]) {
      return showMsg('Vui lòng điền ID và chọn ảnh!', true)
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('id', uploadForm.id)
      fd.append('grp', uploadSlot.grp)
      fd.append('brand_id', uploadSlot.brandId)
      fd.append('click_url', uploadForm.click_url || brand.login_url || '#')
      fd.append('sort_order', '0')
      fd.append('image', fileRef.current.files[0])
      const res = await bannerApi.create(fd)
      if (!res.success) throw new Error(res.message)
      setUploadSlot(null)
      setUploadForm({ id: '', click_url: '' })
      setUploadPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      showMsg('Đã upload banner!')
      load()
    } catch (e: any) {
      showMsg(e.message || 'Lỗi khi upload!', true)
    } finally {
      setSaving(false)
    }
  }

  const inp = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: '#F8FAFC',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 10px',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    ...extra
  })

  const iBtn = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: 'none',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    flexShrink: 0,
    ...extra
  })

  const filteredBrands = brands
    .filter(b =>
      !filterText ||
      b.name.toLowerCase().includes(filterText.toLowerCase()) ||
      b.id.toLowerCase().includes(filterText.toLowerCase())
    )
    .filter(b =>
      filterActive === 'all' ||
      (filterActive === 'active' ? b.is_active : !b.is_active)
    )

  return (
    <>
      <Header
        title="Nhà Cái"
        actions={
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setAddForm({ id: '', name: '', login_url: '', register_url: '' })
            }}
            style={{
              background: 'var(--accent)', color: 'white', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '6px 14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '6px', fontSize: '13px', fontWeight: 500
            }}
          >
            <Plus size={14} /> Thêm nhà cái
          </button>
        }
      />
      <main style={{ padding: '20px', flex: 1 }}>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#DC2626' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#16A34A' }}>
            {success}
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '14px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Thêm nhà cái mới</h3>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontWeight: 500 }}>
                  ID * <span style={{ fontWeight: 400 }}>(a-z, 0-9, -)</span>
                </label>
                <input
                  style={inp()}
                  placeholder="vd: net88"
                  value={addForm.id}
                  onChange={e => setAddForm({ ...addForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontWeight: 500 }}>Tên nhà cái *</label>
                <input
                  style={inp()}
                  placeholder="vd: Net88"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontWeight: 500 }}>Login URL</label>
                <input
                  style={inp()}
                  placeholder="https://..."
                  value={addForm.login_url}
                  onChange={e => setAddForm({ ...addForm, login_url: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontWeight: 500 }}>Register URL</label>
                <input
                  style={inp()}
                  placeholder="https://..."
                  value={addForm.register_url}
                  onChange={e => setAddForm({ ...addForm, register_url: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddForm(false)} style={iBtn()}>
                <X size={12} /> Hủy
              </button>
              <button onClick={handleAdd} disabled={saving} style={iBtn({ background: 'var(--accent)', color: 'white', border: 'none', opacity: saving ? 0.7 : 1 })}>
                <Check size={12} /> {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        )}

        {/* Filter bar */}
        {!loading && brands.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={13}
                color="#94A3B8"
                style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                style={inp({ paddingLeft: '30px' })}
                placeholder="Tìm nhà cái theo tên hoặc ID..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
              />
            </div>
            {([
              { key: 'all', label: 'Tất cả', count: brands.length },
              { key: 'active', label: 'Hoạt động', count: brands.filter(b => b.is_active).length },
              { key: 'inactive', label: 'Tắt', count: brands.filter(b => !b.is_active).length },
            ] as const).map(({ key, label, count }) => {
              const isActive = filterActive === key
              return (
                <button
                  key={key}
                  onClick={() => setFilterActive(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    background: isActive ? 'var(--accent-light)' : '#FFFFFF',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '12px', fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                  <span style={{
                    background: isActive ? 'rgba(37,99,235,0.15)' : 'var(--bg-hover)',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    borderRadius: '20px', padding: '0 6px',
                    fontSize: '11px', lineHeight: '18px',
                  }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Brands List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>Đang tải...</div>
        ) : brands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <Building2 size={36} style={{ marginBottom: '10px', opacity: 0.25 }} />
            <p style={{ fontWeight: 500, marginBottom: '4px' }}>Chưa có nhà cái nào</p>
            <p style={{ fontSize: '13px', color: '#CBD5E1' }}>Click "+ Thêm nhà cái" để bắt đầu</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>Không tìm thấy nhà cái nào</p>
            <p style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '4px' }}>Thử từ khóa hoặc bộ lọc khác</p>
          </div>
        ) : (
          filteredBrands.map(brand => {
            const isExpanded = expandedId === brand.id
            const bannerCount = getBannerCount(brand)
            const isEditingName = editingBrandId === brand.id
            const isChangingUrl = changingUrlBrandId === brand.id

            return (
              <div
                key={brand.id}
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${isChangingUrl ? '#DDD6FE' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: brand.is_active ? 1 : 0.65,
                  transition: 'border-color 0.15s, opacity 0.2s',
                }}
              >
                {/* Main row */}
                <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Toggle pill */}
                  <button
                    onClick={() => toggleBrand(brand)}
                    title={brand.is_active ? 'Đang hoạt động — click để tắt' : 'Đang tắt — click để bật'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                  >
                    <div style={{
                      width: '36px', height: '20px',
                      borderRadius: '10px',
                      background: brand.is_active ? '#16A34A' : '#CBD5E1',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        left: brand.is_active ? '19px' : '3px',
                        width: '14px', height: '14px',
                        borderRadius: '50%',
                        background: 'white',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </button>

                  {/* ID badge */}
                  <code style={{ fontSize: '11px', background: '#F1F5F9', color: '#2563EB', padding: '2px 7px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                    {brand.id}
                  </code>

                  {/* Name / inline edit */}
                  {isEditingName ? (
                    <input
                      autoFocus
                      value={editBrandForm.name}
                      onChange={e => setEditBrandForm({ name: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveBrandName(brand.id)
                        if (e.key === 'Escape') setEditingBrandId(null)
                      }}
                      style={inp({ flex: 1, fontWeight: 600, fontSize: '14px' })}
                    />
                  ) : (
                    <span style={{ fontWeight: 600, fontSize: '14px', flex: 1, color: 'var(--text)' }}>
                      {brand.name}
                    </span>
                  )}

                  {/* Banner count badge */}
                  <span style={{
                    background: bannerCount === 5 ? '#F0FDF4' : '#EFF6FF',
                    color: bannerCount === 5 ? '#16A34A' : '#2563EB',
                    border: `1px solid ${bannerCount === 5 ? '#BBF7D0' : '#BFDBFE'}`,
                    borderRadius: '20px', padding: '2px 9px',
                    fontSize: '11px', fontWeight: 600, flexShrink: 0,
                  }}>
                    {bannerCount}/5 banners
                  </span>

                  {/* Edit name */}
                  {isEditingName ? (
                    <>
                      <button onClick={() => saveBrandName(brand.id)} style={iBtn({ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' })}>
                        <Check size={12} />
                      </button>
                      <button onClick={() => setEditingBrandId(null)} style={iBtn()}>
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setEditingBrandId(brand.id); setEditBrandForm({ name: brand.name }) }}
                      style={iBtn()}
                    >
                      <Pencil size={12} /> Sửa
                    </button>
                  )}

                  {/* Đổi URL */}
                  <button
                    onClick={() => {
                      if (isChangingUrl) {
                        setChangingUrlBrandId(null)
                      } else {
                        setChangingUrlBrandId(brand.id)
                        setChangeUrlForm({ login_url: brand.login_url || '', register_url: brand.register_url || '' })
                        setEditingBrandId(null)
                      }
                    }}
                    style={iBtn({
                      color: isChangingUrl ? '#7C3AED' : 'var(--text-secondary)',
                      border: `1px solid ${isChangingUrl ? '#DDD6FE' : 'var(--border)'}`,
                      background: isChangingUrl ? '#F5F3FF' : 'none',
                    })}
                  >
                    <Globe size={12} /> Đổi URL
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteBrand(brand.id, brand.name)}
                    style={iBtn({ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' })}
                  >
                    <Trash2 size={12} /> Xóa
                  </button>

                  {/* Expand */}
                  <button
                    onClick={() => {
                      const next = isExpanded ? null : brand.id
                      setExpandedId(next)
                      if (!next) setUploadSlot(null)
                    }}
                    style={iBtn({ minWidth: '34px', justifyContent: 'center', padding: '4px 6px' })}
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                {/* URL section */}
                {isChangingUrl ? (
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #EDE9FE', background: '#F5F3FF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Globe size={13} color="#7C3AED" />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#7C3AED' }}>Đổi URL nhà cái</span>
                      {bannerCount > 0 && (
                        <span style={{ background: '#EDE9FE', color: '#7C3AED', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500 }}>
                          → {bannerCount} banner tự cập nhật
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#7C3AED', display: 'block', marginBottom: '3px', fontWeight: 500 }}>Login URL</label>
                        <input
                          autoFocus
                          style={inp({ border: '1px solid #DDD6FE', background: 'white' })}
                          placeholder="https://..."
                          value={changeUrlForm.login_url}
                          onChange={e => setChangeUrlForm({ ...changeUrlForm, login_url: e.target.value })}
                          onKeyDown={e => { if (e.key === 'Escape') setChangingUrlBrandId(null) }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#7C3AED', display: 'block', marginBottom: '3px', fontWeight: 500 }}>Register URL</label>
                        <input
                          style={inp({ border: '1px solid #DDD6FE', background: 'white' })}
                          placeholder="https://..."
                          value={changeUrlForm.register_url}
                          onChange={e => setChangeUrlForm({ ...changeUrlForm, register_url: e.target.value })}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveChangeUrl(brand)
                            if (e.key === 'Escape') setChangingUrlBrandId(null)
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setChangingUrlBrandId(null)} style={iBtn()}>
                        <X size={12} /> Hủy
                      </button>
                      <button
                        onClick={() => saveChangeUrl(brand)}
                        style={iBtn({ background: '#7C3AED', color: 'white', border: 'none' })}
                      >
                        <Check size={12} /> Lưu URL
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0 16px 11px', display: 'flex', flexWrap: 'wrap', borderTop: '1px solid #F1F5F9' }}>
                    {(['login_url', 'register_url'] as const).map(field => (
                      <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '9px', paddingRight: '24px', minWidth: '260px', flex: 1, maxWidth: '50%' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
                          {field === 'login_url' ? 'Login:' : 'Register:'}
                        </span>
                        {brand[field] ? (
                          <a
                            href={brand[field]}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
                          >
                            {brand[field]}
                          </a>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#CBD5E1', flex: 1 }}>—</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Expanded: banner grid */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                      {GROUPS.map(grp => {
                        const banner = brand.banners?.[grp] ?? null
                        const isActiveSlot = uploadSlot?.brandId === brand.id && uploadSlot?.grp === grp
                        const color = GROUP_COLORS[grp]

                        return (
                          <div key={grp}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {GROUP_SHORT[grp]}
                            </div>

                            {banner ? (
                              <div
                                style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '16/9', background: '#F1F5F9' }}
                                onMouseEnter={() => setHoverBannerId(banner.id)}
                                onMouseLeave={() => setHoverBannerId(null)}
                              >
                                <img
                                  src={banner.image_url}
                                  alt={banner.title || banner.id}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/160x90/F1F5F9/94A3B8?text=IMG' }}
                                />
                                <div style={{
                                  position: 'absolute', inset: 0,
                                  background: 'rgba(0,0,0,0.5)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  opacity: hoverBannerId === banner.id ? 1 : 0,
                                  transition: 'opacity 0.15s',
                                }}>
                                  <button
                                    onClick={() => deleteBanner(banner.id)}
                                    style={{ background: '#DC2626', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                                  >
                                    <Trash2 size={11} /> Xóa
                                  </button>
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '3px 6px', background: 'rgba(0,0,0,0.45)', fontSize: '10px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {banner.id}
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  if (isActiveSlot) {
                                    setUploadSlot(null)
                                    setUploadPreview(null)
                                  } else {
                                    setUploadSlot({ brandId: brand.id, grp })
                                    setUploadForm({ id: `${brand.id}-${grp}`, click_url: brand.login_url || '' })
                                    setUploadPreview(null)
                                    if (fileRef.current) fileRef.current.value = ''
                                  }
                                }}
                                style={{
                                  border: `2px dashed ${isActiveSlot ? color : '#CBD5E1'}`,
                                  borderRadius: '6px',
                                  aspectRatio: '16/9',
                                  display: 'flex', flexDirection: 'column',
                                  alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', gap: '4px',
                                  background: isActiveSlot ? `${color}15` : '#F8FAFC',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <Plus size={16} color={isActiveSlot ? color : '#94A3B8'} />
                                <span style={{ fontSize: '10px', color: isActiveSlot ? color : '#94A3B8', fontWeight: isActiveSlot ? 600 : 400 }}>
                                  {isActiveSlot ? 'Đang chọn' : 'Upload'}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Upload form */}
                    {uploadSlot?.brandId === brand.id && (
                      <div style={{ marginTop: '12px', padding: '14px', background: '#F8FAFC', borderRadius: 'var(--radius)', border: `1px solid ${GROUP_COLORS[uploadSlot.grp]}50` }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: GROUP_COLORS[uploadSlot.grp] }}>
                            Upload banner {GROUP_SHORT[uploadSlot.grp]}
                          </span>
                          <button
                            onClick={() => { setUploadSlot(null); setUploadPreview(null) }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 'auto', display: 'flex' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontWeight: 500 }}>
                              ID Banner * <span style={{ fontWeight: 400 }}>(a-z, 0-9, -)</span>
                            </label>
                            <input
                              style={inp()}
                              value={uploadForm.id}
                              onChange={e => setUploadForm({ ...uploadForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontWeight: 500 }}>
                              Click URL <span style={{ fontWeight: 400 }}>(mặc định: Login URL)</span>
                            </label>
                            <input
                              style={inp()}
                              placeholder={brand.login_url || 'https://...'}
                              value={uploadForm.click_url}
                              onChange={e => setUploadForm({ ...uploadForm, click_url: e.target.value })}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            onClick={() => fileRef.current?.click()}
                            style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', background: 'white', flexShrink: 0 }}
                          >
                            <input
                              ref={fileRef}
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={e => {
                                const f = e.target.files?.[0]
                                if (f) {
                                  const reader = new FileReader()
                                  reader.onload = ev => setUploadPreview(ev.target?.result as string)
                                  reader.readAsDataURL(f)
                                }
                              }}
                            />
                            <Upload size={12} /> Chọn ảnh
                          </div>
                          {uploadPreview && (
                            <img src={uploadPreview} alt="preview" style={{ height: '36px', borderRadius: '4px', border: '1px solid var(--border)', objectFit: 'cover' }} />
                          )}
                          <div style={{ flex: 1 }} />
                          <button
                            onClick={() => handleUpload(brand)}
                            disabled={saving}
                            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '6px 16px', fontSize: '12px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px', opacity: saving ? 0.7 : 1 }}
                          >
                            <Upload size={12} /> {saving ? 'Đang upload...' : 'Upload'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </main>
    </>
  )
}
