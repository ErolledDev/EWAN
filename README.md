# Chat Widget System

A modern, customizable chat widget that can be easily installed on any website. The widget includes auto-reply, advanced reply, AI mode, and live chat functionality.

## Features

- **Widget Settings**: Customize the widget appearance, business name, welcome message, and more
- **Auto Reply**: Set up keyword-based responses to common questions
- **Advanced Reply**: Create rich responses with HTML and clickable links
- **AI Mode**: Let AI handle complex queries with context about your business
- **Live Chat**: Jump in and chat directly with your visitors when needed

## Installation

1. Add the script to your website:

```html
<script src="https://widget-chat-ai.netlify.app/chat.js"></script>

<script>
  new BusinessChatPlugin({
    uid: 'YOUR_USER_ID'
  });
</script>
```

2. Replace `YOUR_USER_ID` with your user ID from the dashboard.

## Development

### Prerequisites

- Node.js
- npm or yarn
- Supabase account

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server:

```bash
npm run dev
```

### Building the Widget

To build the widget for production:

```bash
npm run build:widget
```

This will create a `dist/widget` directory with the widget files.

## Database Schema

The application uses Supabase with the following tables:

- `widget_settings`: Stores widget configuration
- `auto_replies`: Stores keyword-based auto replies
- `advanced_replies`: Stores advanced replies with HTML/URL support
- `chat_sessions`: Tracks active chat sessions
- `chat_messages`: Stores all chat messages

## License

MIT