// Simple OAuth configuration test
// Run with: node test-oauth.js

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL'
];

const oauthEnvVars = {
  google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  microsoft: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
  facebook: ['FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET'],
  apple: ['APPLE_CLIENT_ID', 'APPLE_TEAM_ID', 'APPLE_KEY_ID', 'APPLE_PRIVATE_KEY']
};

console.log('🔍 OAuth Configuration Test\n');

// Check required variables
console.log('📋 Required Environment Variables:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`  ${envVar}: ${value ? '✅ Set' : '❌ Missing'}`);
});

console.log('\n🔐 OAuth Provider Configuration:');
Object.entries(oauthEnvVars).forEach(([provider, vars]) => {
  console.log(`\n  ${provider.toUpperCase()}:`);
  const configured = vars.every(envVar => {
    const value = process.env[envVar];
    console.log(`    ${envVar}: ${value ? '✅ Set' : '❌ Missing'}`);
    return !!value;
  });
  console.log(`    Status: ${configured ? '✅ Fully configured' : '⚠️ Incomplete'}`);
});

console.log('\n🌐 OAuth Endpoints:');
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
['google', 'microsoft', 'facebook', 'apple'].forEach(provider => {
  console.log(`  ${provider}: ${baseUrl}/api/auth/oauth/${provider}`);
});

console.log('\n📚 Next Steps:');
console.log('1. Configure OAuth providers in their respective dashboards');
console.log('2. Set environment variables in .env.local');
console.log('3. Test OAuth flows by clicking provider buttons');
console.log('4. Check database for user_providers entries after successful OAuth');