const { execSync } = require('child_process');

console.log('Running seed script...');

try {
  execSync('npx tsx lib/seed.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Seed failed:', error);
  process.exit(1);
}
