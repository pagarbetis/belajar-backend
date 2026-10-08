import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();
// proses
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`)
});
