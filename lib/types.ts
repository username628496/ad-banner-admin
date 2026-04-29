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
  is_active: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export const GROUPS = ['homepage', 'catfish', 'sidebar'] as const
export type Group = typeof GROUPS[number]

export const GROUP_LABELS: Record<string, string> = {
  homepage: 'Homepage',
  catfish: 'Catfish',
  sidebar: 'Sidebar',
}

export const GROUP_COLORS: Record<string, string> = {
  homepage: '#8b5cf6',
  catfish: '#06b6d4',
  sidebar: '#10b981',
}