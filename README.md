
# Discord Bot Order Management System

## New Features

### Order Status Tracking
Users can check their order status using Discord commands:
- `!status <order_number>` - Check the status of a specific order
- `!history` - View complete order history

### Order Management
- `!cancel <order_number>` - Cancel pending orders
- `!modify <order_number>` - Modify order content before acceptance
- `!help` - Show all available commands

### Deadline Reminders
- Automatic reminders sent to admins 24 hours before deadlines
- Deadline parsing from admin timeline responses
- Supports formats like "2 days", "1 week", "3 hours"

### Order History
- Complete order tracking for all users
- Status updates (Pending, Accepted, Rejected, Cancelled, Completed)
- Order timestamps and admin assignments

## Commands

### User Commands (Slash Commands)

#### Order Management
- `/status 1` - Check status of order #1
- `/history` - View all your orders
- `/cancel 1` - Cancel order #1 (if pending)
- `/modify 1` - Modify order #1 content

#### Code Management
- `/addcode bot.js` - Upload code to a file (bot will ask for code in DM)
- `/viewcode` - View all your uploaded code files
- `/deletecode bot.js` - Delete a specific code file

#### Communication
- `/dm @user1,@user2 Hello!` - Send DM to specific users
- `/dmrole @RoleName Hello everyone!` - Send DM to all users with a role
- `/help` - Show help message

### Admin Features
- Accept/Reject buttons in admin channel
- Timeline setting with automatic deadline parsing
- Deadline reminders via DM
- Order assignment tracking

## Setup Requirements

1. Set `DISCORD_BOT_TOKEN` in environment variables
2. Set `ADMIN_CHANNEL_ID` for order notifications
3. Set `ADMIN_ROLE_ID` for admin mentions
4. Ensure bot has DM permissions

## Code Integration Features

### Discord to Website Code Sync
- Users can upload code files directly through Discord commands
- Code automatically appears in the website's coding environment
- Supports multiple file types and syntax highlighting
- Real-time sync between Discord submissions and web interface

### Coding Environment Features
- Three-panel layout: Console (Coming Soon) | Code Editor | Output Terminal
- Dynamic file tabs based on Discord submissions
- Admin-only controls for template management
- Integrated terminal simulation

### Usage Flow
1. User logs in with Discord on website
2. User submits code via `/addcode filename.js` in Discord
3. Bot asks for code in DM
4. User pastes code in Discord DM
5. Code appears instantly in website coding environment
6. User can view, edit, and manage files through web interface

## Status Icons
- ✅ Completed
- ⏳ In Progress / Pending
- ❌ Cancelled / Rejected
- 📋 Default status
