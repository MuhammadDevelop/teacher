const API = '/api';

export async function registerUser(data) {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Xatolik yuz berdi');
  return json;
}

export async function sendCode(phone) {
  const res = await fetch(`${API}/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Xatolik yuz berdi');
  return json;
}

export async function loginUser(phone, code) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Xatolik yuz berdi');
  return json;
}

export async function adminLogin(email, password) {
  const res = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Xatolik yuz berdi');
  return json;
}
