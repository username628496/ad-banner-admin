export interface LoginUrl {
  id: string
  url: string
  created_at?: string
  updated_at?: string
}

export interface Banner {
  id: string
  brand_id?: string
  grp: string
  title: string
  image_url: string
  click_url: string
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Brand {
  id: string
  name: string
  login_url: string
  register_url: string
  is_active: boolean
  sort_order: number
  banners?: {
    slider?: Banner | null
    homepage?: Banner | null
    catfish?: Banner | null
    sidebar?: Banner | null
    popup?: Banner | null
  }
  created_at?: string
  updated_at?: string
}

export interface BannerAll {
  brands: Brand[]
  banners_slider: Banner[]
  banners_homepage: Banner[]
  banners_catfish: Banner[]
  banners_sidebar: Banner[]
  banners_popup: Banner[]
}

export const GROUPS = ['slider', 'homepage', 'catfish', 'sidebar', 'popup'] as const
export type Group = typeof GROUPS[number]

export const GROUP_LABELS: Record<string, string> = {
  slider: 'Slider (Nhà Cái Uy Tín)',
  homepage: 'Homepage',
  catfish: 'Catfish',
  sidebar: 'Sidebar',
  popup: 'Popup'
}

export const GROUP_COLORS: Record<string, string> = {
  slider: '#6366f1',
  homepage: '#8b5cf6',
  catfish: '#06b6d4',
  sidebar: '#10b981',
  popup: '#f59e0b'
}
