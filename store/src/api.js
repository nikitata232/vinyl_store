const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const getToken = () => localStorage.getItem('token')

async function req(path, opts = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  return res
}

export const api = {
  get:    (path)       => req(path),
  post:   (path, data) => req(path, { method: 'POST',   body: JSON.stringify(data) }),
  put:    (path, data) => req(path, { method: 'PUT',    body: JSON.stringify(data) }),
  patch:  (path, data) => req(path, { method: 'PATCH',  body: JSON.stringify(data) }),
  delete: (path)       => req(path, { method: 'DELETE' }),
}
