/**
 * Configuration file for Matrix Terminal n8n Integration
 * Handles webhook settings and environment-specific configurations
 */

const MatrixConfig = {
    // Get webhook URL from environment variables
    getWebhookUrl() {
        // Try different ways to access environment variables in production
        let webhookUrl = null;

        // Method 1: Vite environment variables (build-time injection)
        try {
            if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env.VITE_N8N_WEBHOOK_URL) {
                webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
            }
        } catch (e) {
            // import.meta might not be available in some environments
        }

        // Method 2: Process environment (Node.js/SSR)
        if (!webhookUrl && typeof process !== 'undefined' && process.env && process.env.VITE_N8N_WEBHOOK_URL) {
            webhookUrl = process.env.VITE_N8N_WEBHOOK_URL;
        }

        // Method 3: Window environment (injected by build)
        if (!webhookUrl && typeof window !== 'undefined' && window.ENV && window.ENV.VITE_N8N_WEBHOOK_URL) {
            webhookUrl = window.ENV.VITE_N8N_WEBHOOK_URL;
        }

        // Method 4: Window environment config (injected at build time)
        if (!webhookUrl && typeof window !== 'undefined' && window.ENV_CONFIG && window.ENV_CONFIG.WEBHOOK_URL) {
            webhookUrl = window.ENV_CONFIG.WEBHOOK_URL;

            // Check if it's still a placeholder
            if (webhookUrl === 'PLACEHOLDER_WEBHOOK_URL') {
                webhookUrl = null;
            }
        }

        if (!webhookUrl) {
            console.error('[CONFIG] No webhook URL found in environment variables');
            console.error('[CONFIG] Available methods: import.meta.env, process.env, window.ENV');
            console.error('[CONFIG] Expected variable: VITE_N8N_WEBHOOK_URL');
        }

        return webhookUrl;
    },

    // Development settings
    development: {
        useProxy: true,
        proxyUrl: '/proxy',
        get webhookUrl() {
            return MatrixConfig.getWebhookUrl();
        },
        timeout: 10000, // 10 seconds
        retries: 2,
        enableFallback: true
    },

    // Production settings (for when you deploy)
    production: {
        useProxy: false,
        proxyUrl: null,
        get webhookUrl() {
            return MatrixConfig.getWebhookUrl();
        },
        timeout: 15000, // 15 seconds
        retries: 3,
        enableFallback: true
    },

    // Current environment (auto-detect or manual override)
    getCurrentConfig() {
        // Auto-detect environment based on hostname
        const isDevelopment = window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1' ||
                             window.location.port !== '';

        const env = isDevelopment ? 'development' : 'production';
        const config = this[env];

        // Validate webhook URL is available
        if (!config.webhookUrl) {
            console.error(`[CONFIG] Missing webhook URL for ${env} environment`);
            console.error('[CONFIG] Please check your environment variables');
            console.error('[CONFIG] Expected: VITE_N8N_WEBHOOK_URL');
        }

        console.log(`[CONFIG] Detected environment: ${env}`);
        console.log(`[CONFIG] Webhook URL configured: ${config.webhookUrl ? 'Yes' : 'No'}`);

        return config;
    },

    // Get the appropriate endpoint URL for API calls
    getEndpointUrl(message) {
        const config = this.getCurrentConfig();

        if (config.useProxy) {
            // Use local proxy endpoint
            return `${config.proxyUrl}?message=${encodeURIComponent(message)}`;
        } else {
            // Use direct n8n webhook
            return `${config.webhookUrl}?message=${encodeURIComponent(message)}`;
        }
    },

    // Fallback responses when webhook is unavailable
    fallbackResponses: [
        "I'm experiencing some connectivity issues with the Matrix. Let me try to help you anyway.",
        "The neural pathways are temporarily disrupted. Running on backup protocols...",
        "Connection to the main server is unstable. Processing your request locally...",
        "Quantum entanglement with the primary system is weak. Switching to auxiliary mode...",
        "The Matrix grid is experiencing fluctuations. Your message was received, processing offline...",
        "Primary AI cores are offline. Emergency response protocols engaged...",
        "Network connection to the Matrix disrupted. Running diagnostic procedures...",
        "Communication array is down. Attempting to establish backup connection..."
    ],

    // Get a random fallback response
    getFallbackResponse() {
        const responses = this.fallbackResponses;
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // Validation helpers
    validateWebhookResponse(response) {
        if (!response) return false;

        // Check if it's the n8n array format: [{"text": "message"}]
        if (Array.isArray(response) && response.length > 0) {
            const firstItem = response[0];
            if (firstItem && firstItem.text && typeof firstItem.text === 'string') {
                return true;
            }
        }

        // Check if it's a valid JSON response with success property
        if (typeof response === 'object' && response.success !== undefined) {
            return response.success;
        }

        // Check if it's an object with text property
        if (typeof response === 'object' && response.text && typeof response.text === 'string') {
            return true;
        }

        // Check if it's a string response
        if (typeof response === 'string' && response.trim().length > 0) {
            return true;
        }

        return false;
    },

    // Extract message content from webhook response
    extractMessage(response) {
        if (typeof response === 'string') {
            return response.trim();
        }

        if (typeof response === 'object') {
            // Handle n8n array response format: [{"text": "message"}]
            if (Array.isArray(response) && response.length > 0) {
                const firstItem = response[0];
                if (firstItem && firstItem.text) {
                    return firstItem.text.trim();
                }
            }

            // Handle direct object response
            if (response.text) {
                return response.text.trim();
            }

            // Try other possible response formats from n8n
            return response.message ||
                   response.response ||
                   response.content ||
                   response.data ||
                   JSON.stringify(response);
        }

        return "Response received but format not recognized.";
    },

    // Debug logging (can be disabled in production)
    debug: {
        enabled: true,
        log(message, data = null) {
            if (this.enabled) {
                console.log(`[MATRIX CONFIG] ${message}`, data || '');
            }
        },
        error(message, error = null) {
            console.error(`[MATRIX ERROR] ${message}`, error || '');
        }
    }
};

// Make config available globally
window.MatrixConfig = MatrixConfig;

// Log initial configuration
MatrixConfig.debug.log('Configuration loaded', MatrixConfig.getCurrentConfig());