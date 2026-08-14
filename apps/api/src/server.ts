import { app } from "./app.js";

const port = 3333;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});