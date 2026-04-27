const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('api_url') || 'http://localhost:3000'
  }
  return 'http://localhost:3000'
}

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token') || ''
  }
  return ''
}

const authHeaders = () => ({
  'x-admin-token': getToken()
})

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  'x-admin-token': getToken()
})

// ── Generic fetch wrapper ──
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const res = await fetch(`${getBaseUrl()}${path}`, options)
  return res.json()
}

// ── Banners ──
export const bannerApi = {
  getAll: () => request<any>('/api/banners/admin/all', { headers: authHeaders() }),

  getByGroup: (group: string) =>
    request<any[]>(`/api/banners?group=${group}`),

  create: (formData: FormData) =>
    fetch(`${getBaseUrl()}/api/banners`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    }).then(r => r.json()),

  update: (id: string, data: Record<string, any>) =>
    request(`/api/banners/${id}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(data)
    }),

  updateImage: (id: string, formData: FormData) =>
    fetch(`${getBaseUrl()}/api/banners/${id}/image`, {
      method: 'PUT',
      headers: authHeaders(),
      body: formData
    }).then(r => r.json()),

  reorder: (orders: { id: string; sort_order: number }[]) =>
    request('/api/banners/reorder', {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify({ orders })
    }),

  delete: (id: string) =>
    request(`/api/banners/${id}`, {
      method: 'DELETE',
      headers: jsonHeaders()
    })
}

// ── Brands ──
export const brandApi = {
  getAll: () => request<any[]>('/api/brands'),

  create: (data: { id: string; name: string; login_url?: string; register_url?: string }) =>
    request('/api/brands', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(data)
    }),

  update: (id: string, data: Record<string, any>) =>
    request(`/api/brands/${id}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(data)
    }),

  delete: (id: string) =>
    request(`/api/brands/${id}`, {
      method: 'DELETE',
      headers: jsonHeaders()
    })
}

// ── Login URLs ──
export const loginUrlApi = {
  getAll: () => request<any[]>('/api/login-urls'),

  create: (data: { id: string; url: string }) =>
    request('/api/login-urls', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(data)
    }),

  update: (id: string, data: { url: string; newId?: string }) =>
    request(`/api/login-urls/${id}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(data)
    }),

  delete: (id: string) =>
    request(`/api/login-urls/${id}`, {
      method: 'DELETE',
      headers: jsonHeaders()
    })
}

export { getBaseUrl }
