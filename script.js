class MatrixTerminal {
    constructor() {
        this.messages = document.getElementById('messages');
        this.userInput = document.getElementById('user-input');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.statusDot = document.getElementById('status-dot');
        this.statusText = document.getElementById('status-text');
        this.bootSequence = document.getElementById('boot-sequence');

        this.isTyping = false;
        this.commandHistory = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startBootSequence();
    }

    setupEventListeners() {
        this.userInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.userInput.addEventListener('input', () => this.updateCursor());

        document.addEventListener('click', () => {
            if (!this.isTyping) {
                this.userInput.focus();
            }
        });
    }

    startBootSequence() {
        setTimeout(() => {
            this.bootSequence.style.display = 'none';
            this.setStatus('online', 'SYSTEM ONLINE');
            this.addSystemMessage('Matrix Terminal initialized. AI Assistant ready.');
            this.addSystemMessage('Type your message or use commands: help, clear, status');
            this.userInput.focus();
        }, 4000);
    }

    handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.processInput();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory('up');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory('down');
        } else if (e.key === 'Tab') {
            e.preventDefault();
        }
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        if (direction === 'up') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
            }
        } else {
            if (this.historyIndex > -1) {
                this.historyIndex--;
            }
        }

        if (this.historyIndex === -1) {
            this.userInput.value = '';
        } else {
            this.userInput.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
        }
        this.updateCursor();
    }

    updateCursor() {
        const cursor = document.getElementById('cursor');
        const inputWidth = this.userInput.value.length;
        cursor.style.marginLeft = `${inputWidth * 0.6}em`;
    }

    processInput() {
        const input = this.userInput.value.trim();
        if (!input) return;

        this.commandHistory.unshift(input);
        this.historyIndex = -1;

        this.addUserMessage(input);
        this.userInput.value = '';
        this.updateCursor();

        if (input.startsWith('/') || this.isCommand(input)) {
            this.handleCommand(input);
        } else {
            this.handleChatMessage(input);
        }
    }

    isCommand(input) {
        const commands = ['help', 'clear', 'status', 'history', 'whoami', 'date', 'uptime', 'webhook', 'config', 'test'];
        return commands.includes(input.toLowerCase());
    }

    handleCommand(input) {
        const command = input.toLowerCase().replace('/', '');

        switch (command) {
            case 'help':
                this.addSystemMessage('Available commands:');
                this.addSystemMessage('  help     - Show this help message');
                this.addSystemMessage('  clear    - Clear the terminal');
                this.addSystemMessage('  status   - Show system status');
                this.addSystemMessage('  webhook  - Show n8n webhook status');
                this.addSystemMessage('  config   - Show current configuration');
                this.addSystemMessage('  test     - Test webhook connection');
                this.addSystemMessage('  history  - Show command history');
                this.addSystemMessage('  whoami   - Display current user');
                this.addSystemMessage('  date     - Show current date/time');
                this.addSystemMessage('  uptime   - Show system uptime');
                break;

            case 'clear':
                this.messages.innerHTML = '';
                break;

            case 'status':
                this.addSystemMessage('System Status: ONLINE');
                this.addSystemMessage('AI Assistant: READY');
                this.addSystemMessage('Matrix Protocol: ACTIVE');
                this.addSystemMessage('Neural Link: ESTABLISHED');
                break;

            case 'history':
                this.addSystemMessage('Command History:');
                this.commandHistory.slice(0, 10).forEach((cmd, i) => {
                    this.addSystemMessage(`  ${i + 1}: ${cmd}`);
                });
                break;

            case 'whoami':
                this.addSystemMessage('User: root@matrix');
                this.addSystemMessage('Access Level: Administrator');
                break;

            case 'date':
                this.addSystemMessage(new Date().toString());
                break;

            case 'uptime':
                const uptime = Math.floor((Date.now() - this.startTime) / 1000);
                this.addSystemMessage(`System uptime: ${uptime} seconds`);
                break;

            case 'webhook':
                const config = MatrixConfig.getCurrentConfig();
                this.addSystemMessage('n8n Webhook Configuration:');
                this.addSystemMessage(`  URL: ${config.webhookUrl}`);
                this.addSystemMessage(`  Using Proxy: ${config.useProxy ? 'Yes' : 'No'}`);
                this.addSystemMessage(`  Timeout: ${config.timeout}ms`);
                this.addSystemMessage(`  Retries: ${config.retries}`);
                this.addSystemMessage(`  Fallback Enabled: ${config.enableFallback ? 'Yes' : 'No'}`);
                break;

            case 'config':
                const currentConfig = MatrixConfig.getCurrentConfig();
                const env = window.location.hostname === 'localhost' ? 'development' : 'production';
                this.addSystemMessage('Current Configuration:');
                this.addSystemMessage(`  Environment: ${env}`);
                this.addSystemMessage(`  Proxy Mode: ${currentConfig.useProxy}`);
                this.addSystemMessage(`  Debug Enabled: ${MatrixConfig.debug.enabled}`);
                break;

            case 'test':
                this.addSystemMessage('Testing webhook connection...');
                this.testWebhookConnection();
                break;

            default:
                this.addErrorMessage(`Command not found: ${command}`);
                this.addSystemMessage('Type "help" for available commands.');
        }
    }

    async handleChatMessage(message) {
        this.showTyping();

        try {
            const response = await this.sendToN8N(message);
            this.hideTyping();
            this.addAIMessage(response);
        } catch (error) {
            this.hideTyping();
            MatrixConfig.debug.error('Chat message error:', error);

            // Use fallback response if webhook fails
            const fallbackResponse = MatrixConfig.getFallbackResponse();
            this.addAIMessage(fallbackResponse);
            this.addSystemMessage('Note: Using offline mode due to connection issues.');
        }
    }

    async sendToN8N(message) {
        const config = MatrixConfig.getCurrentConfig();
        const endpointUrl = MatrixConfig.getEndpointUrl(message);

        MatrixConfig.debug.log('Sending message to n8n:', { message, endpointUrl });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);

            const response = await fetch(endpointUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            MatrixConfig.debug.log('Received response from n8n:', data);

            if (MatrixConfig.validateWebhookResponse(data)) {
                return MatrixConfig.extractMessage(data.response || data);
            } else {
                throw new Error('Invalid response format from webhook');
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - Matrix connection unstable');
            } else if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error - Cannot reach the Matrix');
            } else {
                throw error;
            }
        }
    }

    async testWebhookConnection() {
        try {
            this.showTyping();
            const testMessage = 'Connection test from Matrix Terminal';
            const response = await this.sendToN8N(testMessage);
            this.hideTyping();

            this.addSuccessMessage('✓ Webhook connection successful!');
            this.addSystemMessage(`Response: ${response}`);
        } catch (error) {
            this.hideTyping();
            this.addErrorMessage('✗ Webhook connection failed!');
            this.addSystemMessage(`Error: ${error.message}`);
            this.addSystemMessage('Check your n8n webhook configuration and network connection.');
        }
    }

    generateMockResponse(message) {
        const responses = [
            "I understand your query. The Matrix has many layers of complexity to explore.",
            "Interesting perspective. Let me process this through the neural pathways...",
            "Your message has been received and analyzed. How can I assist you further?",
            "The quantum processors indicate this requires deeper analysis. What specific aspect interests you?",
            "Connection established. I'm here to help navigate the digital realm with you.",
            "Processing complete. The data suggests multiple pathways forward.",
            "Your input resonates through the Matrix. Tell me more about what you're seeking.",
            "The algorithms are aligned. I'm ready to assist with your request.",
            "Matrix protocol engaged. How may I serve you in this digital space?",
            "Neural link stabilized. I'm listening and ready to respond to your needs."
        ];

        const mockResponses = {
            'hello': "Greetings, user. Welcome to the Matrix Terminal. How may I assist you today?",
            'hi': "Hello! I'm your AI assistant, operating within the Matrix protocol. What can I help you with?",
            'how are you': "All systems operational. Neural pathways functioning within normal parameters. Ready to assist.",
            'what is the matrix': "The Matrix is everywhere. It is the world that has been pulled over your eyes to blind you from the truth.",
            'help': "I'm here to help! You can ask me questions, have conversations, or use terminal commands."
        };

        const lowerMessage = message.toLowerCase();
        for (let key in mockResponses) {
            if (lowerMessage.includes(key)) {
                return mockResponses[key];
            }
        }

        return responses[Math.floor(Math.random() * responses.length)];
    }

    showTyping() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
    }

    addMessage(content, className, prefix = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;

        const timestamp = this.getTimestamp();
        messageDiv.innerHTML = `<span class="timestamp">[${timestamp}]</span>${prefix}${content}`;

        this.messages.appendChild(messageDiv);
        this.scrollToBottom();

        // Trigger animation
        setTimeout(() => messageDiv.style.opacity = '1', 50);
    }

    addUserMessage(content) {
        this.addMessage(content, 'user-message', '<span class="prompt">root@matrix:~$</span> ');
    }

    addAIMessage(content) {
        this.addMessage(content, 'ai-message', '<span class="prompt">AI@matrix:~$</span> ');
    }

    addSystemMessage(content) {
        this.addMessage(content, 'system-message', '<span class="prompt">SYSTEM:</span> ');
    }

    addErrorMessage(content) {
        this.addMessage(content, 'error-message', '<span class="prompt">ERROR:</span> ');
    }

    addSuccessMessage(content) {
        this.addMessage(content, 'success-message', '<span class="prompt">SUCCESS:</span> ');
    }

    getTimestamp() {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    }

    scrollToBottom() {
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    setStatus(status, text) {
        this.statusDot.className = `status-dot ${status}`;
        this.statusText.textContent = text;
    }
}

// Matrix effect for enhanced experience
class MatrixEffect {
    constructor() {
        this.chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.effects = {
            glitch: () => this.createGlitch(),
            flash: () => this.createFlash()
        };
    }

    createGlitch() {
        const terminal = document.querySelector('.terminal-container');
        terminal.style.animation = 'glitch 0.3s';
        setTimeout(() => {
            terminal.style.animation = '';
        }, 300);
    }

    createFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 255, 65, 0.1);
            z-index: 1000;
            pointer-events: none;
            animation: flash 0.2s;
        `;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 200);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes glitch {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
    }

    @keyframes flash {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.terminal = new MatrixTerminal();
    window.matrixEffect = new MatrixEffect();

    // Set start time for uptime command
    window.terminal.startTime = Date.now();

    // Random matrix effects
    setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance every 5 seconds
            window.matrixEffect.createGlitch();
        }
    }, 5000);
});