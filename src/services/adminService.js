const API = "http://localhost:3000/api/admin";

export const adminAPI = {
  getStats: () => fetch(`${API}/stats`, { credentials: "include" }).then(r => r.json()),
  getUsers: () => fetch(`${API}/users`, { credentials: "include" }).then(r => r.json()),
  getEmails: () => fetch(`${API}/emails`, { credentials: "include" }).then(r => r.json()),
  getThreats: () => fetch(`${API}/threats`, { credentials: "include" }).then(r => r.json()),
  getTraining: () => fetch(`${API}/training`, { credentials: "include" }).then(r => r.json()),
  getLogs: () => fetch(`${API}/logs`, { credentials: "include" }).then(r => r.json()),

  updateRole: (id, role) =>
    fetch(`${API}/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role })
    }).then(r => r.json()),

  toggleUser: (id) =>
    fetch(`${API}/users/${id}/toggle`, {
      method: "PATCH",
      credentials: "include"
    }).then(r => r.json()),

  verifyTraining: (id) =>
    fetch(`${API}/training/${id}/verify`, {
      method: "PATCH",
      credentials: "include"
    }).then(r => r.json())
};
