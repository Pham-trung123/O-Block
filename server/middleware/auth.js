export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Không có quyền admin" });
  }

  next();
}
