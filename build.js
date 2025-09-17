#!/usr/bin/env node
/**
 * Build script to inject environment variables into static files
 * This runs during Vercel deployment to replace placeholders
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Matrix Terminal build process...');

// Get the webhook URL from environment
const webhookUrl = process.env.VITE_N8N_WEBHOOK_URL;

if (!webhookUrl) {
    console.error('❌ ERROR: VITE_N8N_WEBHOOK_URL environment variable not found');
    process.exit(1);
}

console.log('✓ Environment variable found:', webhookUrl.substring(0, 30) + '...');

try {
    // Read the env-config.js template
    const envConfigPath = path.join(__dirname, 'env-config.js');
    let envConfigContent = fs.readFileSync(envConfigPath, 'utf8');

    // Replace the placeholder with the actual webhook URL
    envConfigContent = envConfigContent.replace(
        'PLACEHOLDER_WEBHOOK_URL',
        webhookUrl
    );

    // Write the updated file
    fs.writeFileSync(envConfigPath, envConfigContent);

    console.log('✓ Environment configuration injected successfully');
    console.log('🚀 Matrix Terminal build complete!');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}