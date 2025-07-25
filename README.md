# StudXchange - A Reselling Platform for Students

Welcome to StudXchange! This is a full-stack web application built with Next.js, Tailwind CSS, and Supabase.

## Getting Started

Follow these steps to get the project running locally.

### 1. Supabase Setup

1.  **Create a Supabase Project**: Go to [supabase.com](https://supabase.com), create an account or log in, and start a new project.
2.  **Get API Credentials**: Navigate to your project's dashboard. Go to `Project Settings` > `API`. You will find your `Project URL` and `anon public` API key.
3.  **Run the SQL Schema**: Go to the `SQL Editor` in your Supabase project dashboard. Copy the entire content of the `database.sql` file from this repository and run it. This will create the necessary tables (`users`, `regular_products`, `notes`, `rooms`) and set up security policies.
4.  **Enable Google Authentication**: Go to `Authentication` > `Providers` and enable the Google provider. You'll need to provide the `Client ID` and `Client Secret` from your Google Cloud Console.

### 2. Local Development Setup

1.  **Clone the Repository**: 
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**:
    Create a file named `.env.local` in the root of your project. Copy the contents of `.env.local.example` into it and fill in your Supabase project URL and anon key.

    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
