# GetStream Chat Token Server

This directory contains the token server implementation for GetStream Chat. This server is responsible for securely generating and providing Stream Chat tokens to authenticated users.

## Overview

The token server is a separate Express.js application that generates authentication tokens for Stream Chat. This approach provides better security than generating tokens directly in the client, as it allows you to keep your API Secret secure on the server.

## Setup Instructions

### 1. Prerequisites

- Node.js 14+ installed
- npm or yarn

### 2. Installation

Navigate to the token server directory and install dependencies:

```bash
cd token-server
npm install
```

Required packages:
- express
- cors
- stream-chat
- @supabase/supabase-js
- dotenv

### 3. Environment Variables

Create a `.env` file in the token server directory with the following variables:

```
PORT=3001
VITE_STREAM_API_KEY=your_stream_api_key
VITE_STREAM_API_SECRET=your_stream_api_secret
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:5173
```

### 4. Running the Server

Start the token server:

```bash
node tokenServer.js
```

The server will start on port 3001 (or the port specified in your .env file).

## API Endpoints

### GET /health
- Description: Check if the server is running
- Response: `{ status: "ok" }`

### POST /get-stream-token
- Description: Generate a Stream Chat token for an authenticated user
- Request Body:
  - Option 1: `{ supabaseToken: "user_supabase_access_token" }`
  - Option 2: `{ userId: "user_id" }`
- Response: `{ token: "stream_user_token" }`
- Error Responses:
  - 400: Missing required parameters
  - 401: Invalid Supabase token or user ID
  - 500: Internal server error

## Client-Side Integration

In your frontend application, make sure to:

1. Set the `VITE_TOKEN_SERVER_URL` environment variable in your .env file to point to your token server (e.g., `http://localhost:3001`)
2. Use the `fetchStreamToken` function from the `streamClient.js` to get tokens from the server

## Deployment Considerations

When deploying to production:

1. Host the token server on a separate secure instance
2. Set up proper CORS configuration to only allow requests from your frontend domain
3. Use environment variables for all sensitive information
4. Implement rate limiting to prevent abuse
5. Consider adding request logging for debugging purposes

## Troubleshooting

If you encounter connection issues:
1. Check that the token server is running
2. Verify environment variables are correctly set
3. Check network requests in browser developer tools for error responses
4. Look at the token server logs for any errors 