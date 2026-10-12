const USERS = [
  {
    nama: "Angga",
    email: "Admin@gmail.com",
    password: "12345678",
  },
];

export const login = (req, res) => {
  // Antisipasi kalau req.body bener-bener undefined/kosong
  if (!req.body) {
    return res.status(400).json({
      status: false,
      message: "Body request tidak boleh kosong, tolol! Pake format JSON ya.",
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    // WAJIB PAKAI RETURN SUPAYA GA LANJUT EKSEKUSI KE BAWAH!
    return res.status(400).json({
      status: false,
      message: "Email atau Password required",
    });
  }

  const user = USERS.find((u) => u.email === email && u.password === password);
  if (!user) {
    // 401: unauthorize
    return res.status(401).json({
      status: false,
      message: "Invalid credential",
    });
  }

  return res.status(200).json({
    status: true,
    message: "Login Success",
    data: {
      user: {
        id: user.id || 1, // Antisipasi kalau id-nya undefined
        name: user.nama,
        email: user.email,
      },
      token: `jwt-token-123 - ${Date.now()}`,
    },
  });
};