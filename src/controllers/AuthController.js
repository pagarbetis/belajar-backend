
const USERS = [
  {
    nama: "Angga",
    email: "Admin@gmail.com",
    password: "12345678",
  },
];

export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // 400: bad response (browser)
    // 500: server error
    // 200: success
    res.status(400).json({
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

  res.status(200).json({
    status: true,
    message: "Login Success",
    data: {
      user: {
        id: user.id,
        name: user.nama,
        email: user.email,
      },
      token: `jwt-token-123 ${user.id} - ${Date.now()}`,
    },
  });
};
