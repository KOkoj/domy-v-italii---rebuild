import 'dotenv/config';
import { execSync } from 'node:child_process';

// Ensure schema is up-to-date for tests (requires DATABASE_URL to point at a test DB)
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  // Seed admin for tests
  execSync('npm run db:seed', { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to prepare test database', e);
}
