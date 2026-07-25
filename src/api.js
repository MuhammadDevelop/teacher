const API = '/api';

async function request(url, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...opts, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Xatolik');
  return json;
}

// ── Auth ──
export const registerUser = (d) => request(`${API}/register`, { method: 'POST', body: JSON.stringify(d) });
export const sendCode = (phone) => request(`${API}/send-code`, { method: 'POST', body: JSON.stringify({ phone }) });
export const verifyCode = (phone, code) => request(`${API}/verify`, { method: 'POST', body: JSON.stringify({ phone, code }) });
export const adminLogin = (email, password) => request(`${API}/admin/login`, { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request(`${API}/me`);

// ── Admin ──
export const adminDashboard = () => request(`${API}/admin/dashboard`);
export const adminStudents = (params = '') => request(`${API}/admin/students?${params}`);
export const adminDeleteStudent = (id) => request(`${API}/admin/students/${id}`, { method: 'DELETE' });
export const adminCheckDuplicates = () => request(`${API}/admin/check-duplicates`);
export const adminTests = (params = '') => request(`${API}/admin/tests?${params}`);
export const adminCreateTest = (d) => request(`${API}/admin/tests`, { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateTest = (id, d) => request(`${API}/admin/tests/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const adminDeleteTest = (id) => request(`${API}/admin/tests/${id}`, { method: 'DELETE' });
export const adminDeleteAllTests = () => request(`${API}/admin/tests/all`, { method: 'DELETE' });
export const adminHomework = (params = '') => request(`${API}/admin/homework-tasks?${params}`);
export const adminCreateHomework = (d) => request(`${API}/admin/homework-tasks`, { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateHomework = (id, d) => request(`${API}/admin/homework-tasks/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const adminDeleteHomework = (id) => request(`${API}/admin/homework-tasks/${id}`, { method: 'DELETE' });
export const adminDeleteAllHomework = () => request(`${API}/admin/homework-tasks/all`, { method: 'DELETE' });
export const adminExercises = (params = '') => request(`${API}/admin/exercises?${params}`);
export const adminCreateExercise = (d) => request(`${API}/admin/exercises`, { method: 'POST', body: JSON.stringify(d) });
export const adminUpdateExercise = (id, d) => request(`${API}/admin/exercises/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const adminDeleteExercise = (id) => request(`${API}/admin/exercises/${id}`, { method: 'DELETE' });
export const adminDeleteAllExercises = () => request(`${API}/admin/exercises/all`, { method: 'DELETE' });
export const adminTransferCourse = (d) => request(`${API}/admin/transfer-course`, { method: 'POST', body: JSON.stringify(d) });
export const adminSubmissions = (params = '') => request(`${API}/admin/submissions?${params}`);
export const adminGradeSubmission = (id, d) => request(`${API}/admin/submissions/${id}/grade`, { method: 'PUT', body: JSON.stringify(d) });
export const adminDailyGrades = (params = '') => request(`${API}/admin/daily-grades?${params}`);
export const adminRating = (params = '') => request(`${API}/admin/rating?${params}`);

// ── Student ──
export const studentProfile = () => request(`${API}/student/profile`);
export const studentSetAttPassword = (d) => request(`${API}/student/profile/attendance-password`, { method: 'POST', body: JSON.stringify(d) });
export const studentAttendance = (password) => request(`${API}/student/attendance`, { method: 'POST', body: JSON.stringify({ password }) });
export const studentMyAttendance = () => request(`${API}/student/attendance`);
export const studentTests = () => request(`${API}/student/tests`);
export const studentStartTest = (lesson) => request(`${API}/student/tests/start`, { method: 'POST', body: JSON.stringify({ lesson_number: lesson }) });
export const studentSubmitTest = (d) => request(`${API}/student/tests/submit`, { method: 'POST', body: JSON.stringify(d) });
export const studentHomework = () => request(`${API}/student/homework`);
export const studentSubmitHomework = (d) => request(`${API}/student/homework/submit`, { method: 'POST', body: JSON.stringify(d) });
export const studentEditHomework = (id, d) => request(`${API}/student/homework/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const studentExercises = () => request(`${API}/student/exercises`);
export const studentNotifications = () => request(`${API}/student/notifications`);
export const studentMarkRead = () => request(`${API}/student/notifications/read`, { method: 'PUT' });
export const studentRating = () => request(`${API}/student/rating`);
export const studentMyGrades = () => request(`${API}/student/my-grades`);

export async function studentUploadHomework(taskId, file) {
  const token = localStorage.getItem('token');
  const fd = new FormData();
  fd.append('task_id', taskId);
  fd.append('file', file);
  const res = await fetch(`${API}/student/homework/upload`, {
    method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Xatolik');
  return json;
}
