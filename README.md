# Matrix Terminal - n8n Chatbot Integration

A cyberpunk-styled terminal interface for interacting with your n8n chatbot webhook.

## Features

- **Matrix-style UI** - Blue cyberpunk aesthetic with falling text background
- **n8n Webhook Integration** - Direct connection to your n8n chatbot
- **CORS Proxy Server** - Python server to bypass CORS issues during development
- **Terminal Commands** - Built-in commands for testing and configuration
- **Fallback Responses** - Offline mode when webhook is unavailable
- **Responsive Design** - Works on desktop and mobile devices

## Quick Start

### 1. Start the Python Server

```bash
python server.py
```

This starts a local HTTP server on port 8000 with CORS proxy functionality.

### 2. Open the Interface

Navigate to: `http://localhost:8000/index.html`

### 3. Test the Connection

Use the `test` command in the terminal to verify webhook connectivity:

```
test
```

## Available Commands

- `help` - Show all available commands
- `test` - Test webhook connection
- `webhook` - Show n8n webhook configuration
- `config` - Show current environment settings
- `status` - Show system status
- `clear` - Clear the terminal
- `history` - Show command history

## Configuration

The webhook URL is configured in `config.js`:

```javascript
webhookUrl: 'https://mike80slo.app.n8n.cloud/webhook/0f4c8c49-25b2-48b4-b781-a86ff354d504'
```

### Development vs Production

- **Development** (localhost): Uses proxy server to bypass CORS
- **Production**: Makes direct calls to n8n webhook

## Troubleshooting

### Connection Issues

1. **Check n8n webhook**: Ensure your n8n workflow is active and webhook is accessible
2. **Test direct access**: Try the webhook URL directly in your browser
3. **Check proxy server**: Make sure `python server.py` is running
4. **Use test command**: Run `test` in the terminal to diagnose issues

### CORS Errors

If you see CORS errors:

1. Make sure you're accessing via `http://localhost:8000` (not file://)
2. Check that the Python proxy server is running
3. Verify the n8n webhook allows cross-origin requests

### No Response from Chatbot

1. Check n8n workflow is active and published
2. Verify webhook URL in `config.js` is correct
3. Test webhook directly with curl:
   ```bash
   curl "https://mike80slo.app.n8n.cloud/webhook/0f4c8c49-25b2-48b4-b781-a86ff354d504?message=test"
   ```

## File Structure

```
├── index.html              # Main Matrix terminal interface
├── styles.css              # Matrix-style CSS
├── script.js               # Terminal logic + n8n integration
├── config.js               # Webhook configuration
├── matrix-bg-simple.js     # Falling text animation
├── server.py               # Python CORS proxy server
└── README.md              # This file
```

## Development Notes

- The interface automatically detects localhost vs production environments
- Debug logging is enabled by default (check browser console)
- Fallback responses are used when webhook is unavailable
- All Matrix styling uses blue color scheme (#4cc9f0)

## Deployment

For production deployment:

1. Update webhook URL in `config.js` if needed
2. Ensure n8n webhook allows cross-origin requests from your domain
3. Deploy static files to web server
4. No Python server needed in production (direct webhook calls)

## n8n Webhook Format

Your n8n webhook should:

1. Accept GET requests with `message` query parameter
2. Return JSON response with your chatbot's reply
3. Handle CORS headers if called directly from browser

Example n8n response format:
```json
{
  "response": "Hello! I'm your AI assistant. How can I help you today?"
}
```

---

**Matrix Terminal** - Enter the digital realm and chat with your AI assistant in style! 🕶️