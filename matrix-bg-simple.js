// Simple Matrix Rain Effect
function initMatrixRain() {
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix characters (mix of katakana, latin, and numbers)
    const chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Settings
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);

    // Initialize drops array with staggered starts
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = -Math.random() * 100; // Start above screen
    }

    function draw() {
        // Black background with opacity for fading effect (less fade for more visibility)
        ctx.fillStyle = 'rgba(0, 8, 20, 0.02)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set font
        ctx.font = fontSize + 'px "Source Code Pro", monospace';

        // Draw characters
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const char = chars[Math.floor(Math.random() * chars.length)];

            // Draw character
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Calculate alpha based on position (brighter at top, fading down)
            const alpha = Math.max(0.2, 1 - (drops[i] / (canvas.height / fontSize)) * 0.8);

            // Draw main character with strong glow
            ctx.shadowColor = '#4cc9f0';
            ctx.shadowBlur = 15;
            ctx.fillStyle = `rgba(76, 201, 240, ${alpha})`;
            ctx.fillText(char, x, y);

            // Add extra bright glow for leading characters
            if (alpha > 0.8) {
                ctx.shadowBlur = 25;
                ctx.fillStyle = `rgba(200, 230, 255, ${alpha * 0.8})`;
                ctx.fillText(char, x, y);
            }

            ctx.shadowBlur = 0;

            // Move drop down (variable speed)
            drops[i] += Math.random() * 0.5 + 0.3;

            // Reset drop to top randomly or when it reaches bottom
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = -Math.random() * 20; // Start above screen
            }
        }
    }

    // Animation loop
    function animate() {
        draw();
        requestAnimationFrame(animate);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Recalculate columns
        const newColumns = Math.floor(canvas.width / fontSize);
        while (drops.length < newColumns) {
            drops.push(0);
        }
        drops.length = newColumns;
    });

    // Start animation
    animate();

    console.log('Matrix rain initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMatrixRain);
} else {
    initMatrixRain();
}