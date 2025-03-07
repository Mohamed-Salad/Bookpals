# Reader Social Platform

A full-stack social platform for readers to connect, share their reading preferences, and engage in discussions about books.

## Features

- User authentication (signup, login, logout)
- Profile management with reading preferences
- User matching based on reading interests
- Real-time messaging for private and group chats
- Reading group creation and management

## Tech Stack

- Frontend: React.js with TypeScript
- UI Framework: Material-UI
- Backend: Supabase (PostgreSQL + Authentication)
- Real-time: Supabase Realtime API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd reader-social-platform
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a Supabase project and get your project URL and anon key.

4. Create a `.env` file in the root directory and add your Supabase credentials:

   ```
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Set up the Supabase database tables:

   ```sql
   -- Create user_profiles table
   create table user_profiles (
     id uuid references auth.users on delete cascade,
     email text,
     username text unique,
     created_at timestamp with time zone default timezone('utc'::text, now()),
     reading_preferences text[],
     favorite_books text[],
     bio text,
     primary key (id)
   );

   -- Create reading_groups table
   create table reading_groups (
     id uuid default uuid_generate_v4(),
     name text,
     description text,
     created_by uuid references auth.users,
     created_at timestamp with time zone default timezone('utc'::text, now()),
     members uuid[],
     genre text,
     primary key (id)
   );

   -- Create messages table
   create table messages (
     id uuid default uuid_generate_v4(),
     content text,
     sender_id uuid references auth.users,
     receiver_id uuid references auth.users,
     group_id uuid references reading_groups,
     created_at timestamp with time zone default timezone('utc'::text, now()),
     primary key (id)
   );
   ```

6. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── components/     # React components
├── contexts/      # React contexts
├── services/      # API and service functions
├── config/        # Configuration files
├── types/         # TypeScript type definitions
└── App.tsx        # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
