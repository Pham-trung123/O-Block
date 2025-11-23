import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../services/adminService";

const TABS = [
  { id: "dashboard", label: "Dashboard tổng quan", icon: "📊" },
  { id: "users", label: "Người dùng", icon: "👥" },
  { id: "emails", label: "Email đã phân tích", icon: "📧" },
  { id: "threats", label: "Mẫu đe dọa", icon: "🚨" },
  { id: "training", label: "Training data", icon: "🧠" },
  { id: "logs", label: "Nhật ký hệ thống", icon: "📜" },
];

const USERS_PER_PAGE = 10;
const EMAILS_PER_PAGE = 10;

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [emails, setEmails] = useState([]);
  const [threats, setThreats] = useState([]);
  const [training, setTraining] = useState([]);
  const [logs, setLogs] = useState([]);

  const [usersPage, setUsersPage] = useState(1);
  const [emailsPage, setEmailsPage] = useState(1);

  // Nếu chưa login hoặc không phải admin -> đá về home
  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Load tất cả dữ liệu admin
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    async function loadData() {
      setLoading(true);
      try {
        const [
          statsRes,
          usersRes,
          emailsRes,
          threatsRes,
          trainingRes,
          logsRes,
        ] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getUsers(),
          adminAPI.getEmails(),
          adminAPI.getThreats(),
          adminAPI.getTraining(),
          adminAPI.getLogs(),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (usersRes.success) setUsers(usersRes.users);
        if (emailsRes.success) setEmails(emailsRes.emails);
        if (threatsRes.success) setThreats(threatsRes.threats);
        if (trainingRes.success) setTraining(trainingRes.data);
        if (logsRes.success) setLogs(logsRes.logs);
      } catch (err) {
        console.error("Load admin data error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  async function handleRefresh() {
    if (!user || user.role !== "admin") return;
    setRefreshing(true);
    try {
      const statsRes = await adminAPI.getStats();
      if (statsRes.success) setStats(statsRes.data);

      if (activeTab === "users") {
        const usersRes = await adminAPI.getUsers();
        if (usersRes.success) setUsers(usersRes.users);
      } else if (activeTab === "emails") {
        const emailsRes = await adminAPI.getEmails();
        if (emailsRes.success) setEmails(emailsRes.emails);
      } else if (activeTab === "threats") {
        const threatsRes = await adminAPI.getThreats();
        if (threatsRes.success) setThreats(threatsRes.threats);
      } else if (activeTab === "training") {
        const trainingRes = await adminAPI.getTraining();
        if (trainingRes.success) setTraining(trainingRes.data);
      } else if (activeTab === "logs") {
        const logsRes = await adminAPI.getLogs();
        if (logsRes.success) setLogs(logsRes.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }

  const totalUsersPages = useMemo(
    () => Math.max(1, Math.ceil(users.length / USERS_PER_PAGE)),
    [users.length]
  );
  const totalEmailsPages = useMemo(
    () => Math.max(1, Math.ceil(emails.length / EMAILS_PER_PAGE)),
    [emails.length]
  );

  const pagedUsers = useMemo(() => {
    const start = (usersPage - 1) * USERS_PER_PAGE;
    return users.slice(start, start + USERS_PER_PAGE);
  }, [users, usersPage]);

  const pagedEmails = useMemo(() => {
    const start = (emailsPage - 1) * EMAILS_PER_PAGE;
    return emails.slice(start, start + EMAILS_PER_PAGE);
  }, [emails, emailsPage]);

  async function handleToggleUser(userId) {
    if (!window.confirm("Bạn có chắc muốn thay đổi trạng thái tài khoản?")) return;
    const res = await adminAPI.toggleUser(userId);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_active: u.is_active ? 0 : 1 } : u
        )
      );
    } else {
      alert(res.message || "Lỗi thay đổi trạng thái");
    }
  }

  async function handleChangeRole(userId, currentRole) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      !window.confirm(`Đổi quyền người dùng ID ${userId} thành "${newRole}"?`)
    )
      return;
    const res = await adminAPI.updateRole(userId, newRole);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } else {
      alert(res.message || "Lỗi cập nhật role");
    }
  }

  async function handleVerifyTraining(id) {
    const res = await adminAPI.verifyTraining(id);
    if (res.success) {
      setTraining((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, verified_by_admin: 1 } : t
        )
      );
    } else {
      alert("Lỗi xác nhận training data");
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <p>Vui lòng đăng nhập để truy cập trang admin.</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <p>Bạn không có quyền truy cập khu vực này.</p>
      </div>
    );
  }

  // ================== RENDER PHẦN DASHBOARD ==================
  function renderDashboard() {
    if (!stats) return null;

    const riskStats = stats.risk || [];
    const maxRiskCount =
      riskStats.length > 0
        ? Math.max(...riskStats.map((r) => r.count))
        : 1;

    return (
      <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Tổng người dùng"
            value={stats.users}
            sub="Tài khoản đã đăng ký"
          />
          <StatCard
            label="Tổng email đã phân tích"
            value={stats.emails}
            sub="Lịch sử quét AI"
          />
          <StatCard
            label="Tổng phishing phát hiện"
            value={stats.system?.phishing_detected ?? 0}
            sub="Theo system_stats"
          />
          <StatCard
            label="Độ chính xác AI"
            value={`${stats.system?.accuracy_rate ?? 0}%`}
            sub="Từ bảng system_stats"
          />
        </div>

        {/* Risk level chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Biểu đồ mức độ rủi ro
              <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">
                Realtime từ email_analysis
              </span>
            </h3>
          </div>
          {riskStats.length === 0 ? (
            <p className="text-slate-400 text-sm">
              Chưa có dữ liệu phân tích.
            </p>
          ) : (
            <div className="space-y-3">
              {riskStats.map((r) => {
                const width = (r.count / maxRiskCount) * 100;
                const label =
                  r.risk_level === "high"
                    ? "Cao"
                    : r.risk_level === "medium"
                    ? "Trung bình"
                    : "Thấp";
                const color =
                  r.risk_level === "high"
                    ? "bg-red-500"
                    : r.risk_level === "medium"
                    ? "bg-yellow-400"
                    : "bg-emerald-400";

                return (
                  <div key={r.risk_level} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>
                        {label} ({r.risk_level})
                      </span>
                      <span>{r.count} email</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`${color} h-3 rounded-full transition-all duration-700`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System stats detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4">
            <h3 className="text-lg font-semibold mb-2">System Stats</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>
                <span className="text-slate-400">Total emails analyzed: </span>
                {stats.system?.total_emails_analyzed}
              </li>
              <li>
                <span className="text-slate-400">Active threats: </span>
                {stats.system?.active_threats}
              </li>
              <li>
                <span className="text-slate-400">Last updated: </span>
                {stats.system?.last_updated
                  ? new Date(stats.system.last_updated).toLocaleString()
                  : "--"}
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4">
            <h3 className="text-lg font-semibold mb-2">
              Gợi ý thuyết trình đồ án
            </h3>
            <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
              <li>Giải thích tổng số email đã quét và tỉ lệ phishing.</li>
              <li>So sánh số lượng high/medium/low risk.</li>
              <li>Trình bày độ chính xác AI (accuracy_rate).</li>
              <li>Nêu số lượng mối đe dọa đang hoạt động (active_threats).</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ================== RENDER USERS ==================
  function renderUsers() {
    return (
      <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
        <h2 className="text-xl font-semibold">Quản lý người dùng</h2>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/80">
              <tr>
                <Th>ID</Th>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Trạng thái</Th>
                <Th>Ngày tạo</Th>
                <Th className="text-right">Hành động</Th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-slate-400 py-6"
                  >
                    Chưa có người dùng nào.
                  </td>
                </tr>
              )}
              {pagedUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-slate-800 hover:bg-slate-900/80 transition-colors"
                >
                  <Td>{u.id}</Td>
                  <Td>{u.username}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        u.role === "admin"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-slate-600/40 text-slate-100"
                      }`}
                    >
                      {u.role}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        u.is_active
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {u.is_active ? "Active" : "Locked"}
                    </span>
                  </Td>
                  <Td>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleString()
                      : "--"}
                  </Td>
                  <Td className="text-right space-x-2">
                    <button
                      onClick={() => handleChangeRole(u.id, u.role)}
                      className="px-3 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 transition"
                    >
                      Đổi role
                    </button>
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className="px-3 py-1 rounded-lg text-xs bg-red-600/80 hover:bg-red-500 transition"
                    >
                      {u.is_active ? "Khóa" : "Mở khóa"}
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <Pagination
          page={usersPage}
          totalPages={totalUsersPages}
          onPrev={() =>
            setUsersPage((p) => (p > 1 ? p - 1 : p))
          }
          onNext={() =>
            setUsersPage((p) => (p < totalUsersPages ? p + 1 : p))
          }
        />
      </div>
    );
  }

  // ================== RENDER EMAILS ==================
  function renderEmails() {
    return (
      <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
        <h2 className="text-xl font-semibold">Lịch sử email đã phân tích</h2>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="min-w-full text-sm align-top">
            <thead className="bg-slate-950/80">
              <tr>
                <Th>ID</Th>
                <Th>Người dùng</Th>
                <Th>Risk</Th>
                <Th>Nội dung</Th>
                <Th>Điểm</Th>
                <Th>Thời gian</Th>
              </tr>
            </thead>
            <tbody>
              {pagedEmails.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-slate-400 py-6"
                  >
                    Chưa có email nào được phân tích.
                  </td>
                </tr>
              )}
              {pagedEmails.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-slate-800 hover:bg-slate-900/80 transition-colors"
                >
                  <Td>{e.id}</Td>
                  <Td>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {e.user_name || "--"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {e.user_email}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <RiskBadge level={e.risk_level} />
                  </Td>
                  <Td>
                    <div className="max-w-md space-y-1">
                      <p className="text-xs text-slate-300 line-clamp-3">
                        {e.email_content}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {e.content_analysis}
                      </p>
                    </div>
                  </Td>
                  <Td>{e.threat_score}</Td>
                  <Td>
                    {e.analysis_date
                      ? new Date(e.analysis_date).toLocaleString()
                      : "--"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={emailsPage}
          totalPages={totalEmailsPages}
          onPrev={() =>
            setEmailsPage((p) => (p > 1 ? p - 1 : p))
          }
          onNext={() =>
            setEmailsPage((p) => (p < totalEmailsPages ? p + 1 : p))
          }
        />
      </div>
    );
  }

  // ================== RENDER THREATS ==================
  function renderThreats() {
    return (
      <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
        <h2 className="text-xl font-semibold">Mẫu đe dọa đã biết (known_threats)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {threats.length === 0 && (
            <p className="text-slate-400 text-sm">
              Chưa có mẫu đe dọa nào.
            </p>
          )}
          {threats.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                  {t.threat_type}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    t.is_active
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-slate-500/30 text-slate-200"
                  }`}
                >
                  {t.is_active ? "Đang hoạt động" : "Đã tắt"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Domain: <span className="text-slate-200">{t.domain}</span>
              </p>
              <p className="text-xs text-slate-400">
                Sender pattern:{" "}
                <span className="text-slate-200">{t.sender_pattern}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Risk score:{" "}
                <span className="font-semibold text-red-300">
                  {t.risk_score}
                </span>
              </p>
              <p className="text-xs text-slate-300 mt-2 line-clamp-3">
                {t.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================== RENDER TRAINING DATA ==================
  function renderTraining() {
    return (
      <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
        <h2 className="text-xl font-semibold">
          Training data (dữ liệu huấn luyện AI)
        </h2>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="min-w-full text-sm align-top">
            <thead className="bg-slate-950/80">
              <tr>
                <Th>ID</Th>
                <Th>Người thêm</Th>
                <Th>Is phishing</Th>
                <Th>Nội dung</Th>
                <Th>Verified</Th>
                <Th>Hành động</Th>
              </tr>
            </thead>
            <tbody>
              {training.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-slate-400 py-6"
                  >
                    Chưa có dữ liệu huấn luyện.
                  </td>
                </tr>
              )}
              {training.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-slate-800 hover:bg-slate-900/80 transition-colors"
                >
                  <Td>{t.id}</Td>
                  <Td>{t.username || "--"}</Td>
                  <Td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        t.is_phishing
                          ? "bg-red-500/20 text-red-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {t.is_phishing ? "Phishing" : "Hợp lệ"}
                    </span>
                  </Td>
                  <Td>
                    <p className="text-xs text-slate-300 max-w-md line-clamp-3">
                      {t.email_content}
                    </p>
                  </Td>
                  <Td>
                    {t.verified_by_admin ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300">
                        Đã duyệt
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-200">
                        Chưa duyệt
                      </span>
                    )}
                  </Td>
                  <Td>
                    {!t.verified_by_admin && (
                      <button
                        onClick={() => handleVerifyTraining(t.id)}
                        className="px-3 py-1 rounded-lg text-xs bg-emerald-600/80 hover:bg-emerald-500 transition"
                      >
                        Duyệt
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ================== RENDER LOGS ==================
  function renderLogs() {
    return (
      <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
        <h2 className="text-xl font-semibold">Nhật ký hệ thống (system_logs)</h2>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl max-h-[480px] overflow-y-auto">
          <table className="min-w-full text-xs align-top">
            <thead className="bg-slate-950/80">
              <tr>
                <Th>ID</Th>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Description</Th>
                <Th>IP</Th>
                <Th>Thời gian</Th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-slate-400 py-6"
                  >
                    Chưa có log nào.
                  </td>
                </tr>
              )}
              {logs.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-slate-800 hover:bg-slate-900/80 transition-colors"
                >
                  <Td>{l.id}</Td>
                  <Td>{l.username || "--"}</Td>
                  <Td className="font-semibold text-slate-100">
                    {l.action_type}
                  </Td>
                  <Td className="max-w-md text-slate-300">
                    {l.description}
                  </Td>
                  <Td>{l.ip_address}</Td>
                  <Td>
                    {l.log_date
                      ? new Date(l.log_date).toLocaleString()
                      : "--"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ============ MAIN RETURN ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-lg">
        <div className="px-5 pt-5 pb-4 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">
            Phish Hunters{" "}
            <span className="text-emerald-400 text-sm">ADMIN</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị hệ thống phát hiện & cảnh báo email lừa đảo
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  : "text-slate-300 hover:bg-slate-800/70"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-400">
          Đăng nhập với:{" "}
          <span className="text-slate-200">
            {user.email || user.username} ({user.role})
          </span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Bảng điều khiển quản trị
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Theo dõi hoạt động hệ thống, người dùng và kết quả phân tích
              email lừa đảo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <span className="text-xs text-slate-400 animate-pulse">
                Đang tải dữ liệu...
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="px-3 py-2 rounded-xl text-sm bg-slate-900 border border-slate-700 hover:border-emerald-500 hover:text-emerald-300 transition flex items-center gap-2"
            >
              <span className={refreshing ? "animate-spin" : ""}>🔄</span>
              <span>Làm mới</span>
            </button>
          </div>
        </header>

        {/* Nội dung từng tab */}
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "emails" && renderEmails()}
        {activeTab === "threats" && renderThreats()}
        {activeTab === "training" && renderTraining()}
        {activeTab === "logs" && renderLogs()}
      </main>
    </div>
  );
}

/* ======= COMPONENT PHỤ ======= */

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-2 text-left font-semibold text-xs text-slate-300 uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-2 align-top text-sm text-slate-100 ${className}`}>
      {children}
    </td>
  );
}

function RiskBadge({ level }) {
  const upper = (level || "").toLowerCase();
  let color = "bg-emerald-500/20 text-emerald-200";
  let text = "Low";

  if (upper === "high") {
    color = "bg-red-500/25 text-red-200";
    text = "High";
  } else if (upper === "medium") {
    color = "bg-yellow-500/25 text-yellow-200";
    text = "Medium";
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
      {text} ({upper})
    </span>
  );
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-end gap-2 text-xs text-slate-300">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 disabled:opacity-40 hover:border-emerald-500 transition"
      >
        Trang trước
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 disabled:opacity-40 hover:border-emerald-500 transition"
      >
        Trang sau
      </button>
    </div>
  );
}
