require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server listening on PORT:${PORT}`);
});
