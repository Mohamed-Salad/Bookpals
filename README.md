# BookPals

BookPals is a platform designed to connect book lovers through profile-based matching and community-driven discussions. This project aims to create a vibrant community where readers can find others with similar interests and engage in meaningful conversations about literature.

## Project Overview

This application allows users to:
- Create a profile detailing their reading habits and favorite genres.
- Discover and connect with other users based on shared interests.
- Participate in community discussion forums.
- Create and join smaller, focused book clubs or groups.

This project was developed as part of a dissertation submission.

## Technologies Used

- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js (if applicable, specify framework e.g., Express), Supabase (for BaaS features like Auth and Database)
- **Database:** PostgreSQL (managed via Supabase)
- **Authentication:** Supabase Auth
- **Real-time Features (Optional):** Supabase Realtime or GetStream (as initially planned)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or later recommended)
- npm (usually comes with Node.js)
- Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd bookpals
    ```

2.  **Install dependencies:**
    Navigate to the project directory and install the necessary packages.
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add your Supabase project URL and anon key. You can find these in your Supabase project settings (API section).
    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    *Note: The `VITE_` prefix is important if you are using Vite, as it exposes these variables to your frontend code.*

### Running the Application Locally

1.  **Start the Frontend Development Server (Vite):**
    This command will start the React application, typically on `http://localhost:5173` (Vite's default) or `http://localhost:3000`. Check the console output for the exact URL.
    ```bash
    npm run dev
    ```

2.  **(If applicable) Start the Backend Server:**
    If you have a separate Node.js backend (e.g., for custom API routes not handled by Supabase functions), you might have a command like:
    ```bash
    npm run server
    # or
    # node server.js
    ```
    *Specify the correct command based on your `package.json`.*

3.  **Access the Application:**
    Open your web browser and navigate to the URL provided by the `npm run dev` command (e.g., `http://localhost:5173`).

## Database Setup

The database schema is managed through Supabase. Key tables include:
- `profiles`: Stores user profile information, linked to `auth.users`.
- `user_preferences`: Stores user reading preferences and categorization data.
- `communities`: Information about different communities or book clubs.
- `discussions`: Stores main discussion threads within communities.
- `comments`: Stores replies to discussion threads.
- `reactions`: Tracks user reactions (likes) to discussions or comments.

Migrations (if used) can be found in the `supabase/migrations` folder and applied using the Supabase CLI.

## Testing

-   **Run Unit/Integration Tests (Jest/Vitest):**
    ```bash
    npm test
    ```
    *(Adjust command based on your test runner)*

-   **(Optional) Run End-to-End Tests (Cypress):**
    ```bash
    npm run cypress:open
    # or similar command defined in package.json
    ```

## Project Structure

```
/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page-level components (routed views)
│   ├── services/       # API calls, Supabase client, logic (e.g., database.js, recommendationService.js)
│   ├── contexts/       # React Context providers (e.g., AuthContext)
│   ├── hooks/          # Custom React Hooks
│   ├── styles/         # Global styles, Tailwind config
│   └── main.jsx        # Main application entry point
├── supabase/           # Supabase specific files (migrations, functions if used)
├── .env.example        # Example environment variables
├── .gitignore          # Files ignored by Git
├── index.html          # HTML entry point (for Vite)
├── package.json        # Project dependencies and scripts
├── README.md           # This file
└── vite.config.js      # Vite configuration
```

## Notes for Supervisors/Invigilators

-   **Environment Setup:** Ensure the `.env` file is correctly configured with Supabase credentials before running the application.
-   **Supabase Backend:** Most backend logic (database interactions, authentication) is handled directly via the Supabase client library on the frontend or through Supabase database functions/triggers, minimizing the need for a separate traditional backend server unless explicitly built.
-   **Key Features Location:**
    -   User Authentication: `src/contexts/AuthContext.jsx`, Supabase client usage.
    -   Recommendations: `src/services/recommendationService.js`, `src/components/RecommendedUsers.jsx`, `src/components/RecommendedCommunities.jsx`.
    -   Community/Discussions: `src/pages/CommunityView.jsx`, `src/components/DiscussionList.jsx`, `src/services/database.js`.
-   **Data Population:** Initial data (e.g., user profiles, communities) might be required for full feature testing. Check Supabase tables or seed scripts if available.
onedrive location:

https://cityuni-my.sharepoint.com/:f:/r/personal/mohamed_salad_2_city_ac_uk/Documents/Year%203/IN3007%20Personal%20Project/Mohamed%20Salad%20Code%20Submission?csf=1&web=1&e=bCYkj8

You second terminal that generates tokens but I forgot the name
---

*This README provides a comprehensive guide to understanding, installing, and running the BookPals application.*
