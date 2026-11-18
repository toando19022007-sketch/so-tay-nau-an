const jwt = require("jsonwebtoken");

// Middleware xác thực token đăng nhập
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res
      .status(401)
      .json({ message: "Truy cập bị từ chối! Chưa cung cấp Token." });

  try {
    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET || "secret_key",
    );
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token không hợp lệ!" });
  }
};

// Middleware kiểm tra quyền Quản trị viên (ADMIN)
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === "ADMIN") {
      next();
    } else {
      res
        .status(403)
        .json({
          message:
            "Bạn không có quyền thực hiện hành động này (Yêu cầu quyền ADMIN)!",
        });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };
