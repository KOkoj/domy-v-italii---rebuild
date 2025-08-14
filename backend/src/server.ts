import app from './app.js';
import { env } from './env.js';

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}  (Swagger: /api/docs)`);
});