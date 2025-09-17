class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrix-bg');
        this.ctx = this.canvas.getContext('2d');

        this.chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.charArray = this.chars.split('');

        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        this.opacity = [];
        this.speeds = [];

        this.init();
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.columns = Math.floor(this.canvas.width / this.fontSize);

        // Initialize drops, opacity, and speeds arrays
        this.drops = [];
        this.opacity = [];
        this.speeds = [];

        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * this.canvas.height / this.fontSize;
            this.opacity[i] = Math.random() * 0.7 + 0.2;
            this.speeds[i] = Math.random() * 0.5 + 0.3;
        }
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);

        // Adjust arrays for new column count
        while (this.drops.length < this.columns) {
            this.drops.push(Math.random() * this.canvas.height / this.fontSize);
            this.opacity.push(Math.random() * 0.7 + 0.2);
            this.speeds.push(Math.random() * 0.5 + 0.3);
        }

        if (this.drops.length > this.columns) {
            this.drops.splice(this.columns);
            this.opacity.splice(this.columns);
            this.speeds.splice(this.columns);
        }
    }

    drawChar(char, x, y, alpha) {
        this.ctx.fillStyle = `rgba(76, 201, 240, ${alpha})`;
        this.ctx.font = `${this.fontSize}px 'Source Code Pro', monospace`;
        this.ctx.fillText(char, x, y);

        // Add glow effect for some characters
        if (Math.random() < 0.1) {
            this.ctx.shadowColor = '#4cc9f0';
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = `rgba(76, 201, 240, ${alpha * 1.5})`;
            this.ctx.fillText(char, x, y);
            this.ctx.shadowBlur = 0;
        }
    }

    animate() {
        // Create fade effect
        this.ctx.fillStyle = 'rgba(0, 8, 20, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.drops.length; i++) {
            // Get random character
            const char = this.charArray[Math.floor(Math.random() * this.charArray.length)];

            // Calculate position
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;

            // Draw the character with varying opacity
            const alpha = this.opacity[i] * (1 - (this.drops[i] * this.fontSize) / this.canvas.height);
            this.drawChar(char, x, y, Math.max(0, alpha));

            // Move the drop down
            this.drops[i] += this.speeds[i];

            // Reset drop when it reaches bottom or randomly
            if (this.drops[i] * this.fontSize > this.canvas.height || Math.random() > 0.975) {
                this.drops[i] = 0;
                this.opacity[i] = Math.random() * 0.7 + 0.2;
                this.speeds[i] = Math.random() * 0.5 + 0.3;
            }
        }

        requestAnimationFrame(() => this.animate());
    }

    // Method to increase intensity (for special effects)
    intensify(duration = 2000) {
        const originalOpacity = [...this.opacity];
        const originalSpeeds = [...this.speeds];

        // Increase intensity
        this.opacity = this.opacity.map(op => Math.min(1, op * 3));
        this.speeds = this.speeds.map(speed => speed * 2);

        // Reset after duration
        setTimeout(() => {
            this.opacity = originalOpacity;
            this.speeds = originalSpeeds;
        }, duration);
    }

    // Method to decrease intensity
    calm(duration = 3000) {
        const originalOpacity = [...this.opacity];
        const originalSpeeds = [...this.speeds];

        // Decrease intensity
        this.opacity = this.opacity.map(op => op * 0.3);
        this.speeds = this.speeds.map(speed => speed * 0.5);

        // Reset after duration
        setTimeout(() => {
            this.opacity = originalOpacity;
            this.speeds = originalSpeeds;
        }, duration);
    }
}

// Enhanced Matrix digital rain with interactive elements
class InteractiveMatrixRain extends MatrixRain {
    constructor() {
        super();
        this.setupInteractivity();
    }

    setupInteractivity() {
        // Mouse interaction
        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        // Touch interaction for mobile
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMouseMove(touch);
        });
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find nearby columns and affect them
        const columnIndex = Math.floor(x / this.fontSize);
        const range = 3;

        for (let i = Math.max(0, columnIndex - range); i < Math.min(this.columns, columnIndex + range); i++) {
            const distance = Math.abs(i - columnIndex);
            const effect = Math.max(0, 1 - distance / range);

            // Temporarily increase speed and opacity
            if (this.speeds[i] && this.opacity[i]) {
                this.speeds[i] = Math.min(2, this.speeds[i] + effect * 0.5);
                this.opacity[i] = Math.min(0.8, this.opacity[i] + effect * 0.3);
            }
        }
    }

    // Special effects for terminal events
    onTerminalEvent(type) {
        switch (type) {
            case 'message':
                this.createPulse();
                break;
            case 'boot':
                this.intensify(5000);
                break;
            case 'error':
                this.createRedFlash();
                break;
            case 'command':
                this.createRipple();
                break;
        }
    }

    createPulse() {
        const centerColumn = Math.floor(this.columns / 2);
        const range = 10;

        for (let i = Math.max(0, centerColumn - range); i < Math.min(this.columns, centerColumn + range); i++) {
            const distance = Math.abs(i - centerColumn);
            const delay = distance * 50;

            setTimeout(() => {
                if (this.opacity[i]) {
                    this.opacity[i] = Math.min(1, this.opacity[i] * 2);
                    this.speeds[i] = Math.min(2, this.speeds[i] * 1.5);
                }
            }, delay);
        }
    }

    createRipple() {
        const centerColumn = Math.floor(Math.random() * this.columns);
        const maxRange = 15;

        for (let wave = 1; wave <= maxRange; wave++) {
            setTimeout(() => {
                for (let dir of [-1, 1]) {
                    const col = centerColumn + (wave * dir);
                    if (col >= 0 && col < this.columns && this.opacity[col]) {
                        this.opacity[col] = Math.min(0.9, this.opacity[col] * 1.8);
                        this.speeds[col] = Math.min(1.8, this.speeds[col] * 1.3);
                    }
                }
            }, wave * 30);
        }
    }

    createRedFlash() {
        const originalDrawChar = this.drawChar.bind(this);

        // Temporarily change color to red
        this.drawChar = (char, x, y, alpha) => {
            this.ctx.fillStyle = `rgba(255, 68, 68, ${alpha})`;
            this.ctx.font = `${this.fontSize}px 'Source Code Pro', monospace`;
            this.ctx.fillText(char, x, y);
        };

        // Restore original color after 500ms
        setTimeout(() => {
            this.drawChar = originalDrawChar;
        }, 500);
    }
}

// Initialize the Matrix rain effect when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Matrix rain effect
    window.matrixRain = new InteractiveMatrixRain();

    // Connect to terminal events after a delay to ensure terminal is initialized
    setTimeout(() => {
        const originalAddMessage = window.terminal?.addMessage;
        if (originalAddMessage) {
            window.terminal.addMessage = function(content, className, prefix) {
                originalAddMessage.call(this, content, className, prefix);

                // Trigger matrix effects based on message type
                if (className.includes('ai-message')) {
                    window.matrixRain.onTerminalEvent('message');
                } else if (className.includes('error')) {
                    window.matrixRain.onTerminalEvent('error');
                } else if (className.includes('user-message')) {
                    window.matrixRain.onTerminalEvent('command');
                }
            };
        }
    }, 1000);
});