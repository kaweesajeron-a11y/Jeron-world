# Supabase setup for Jeron World

This website is a static GitHub Pages site, so login, chat, comments, and messages need a backend service. The easiest option is Supabase.

1. Create a Supabase project
   - Go to https://supabase.com
   - Create a new project
   - Copy the Project URL and anon key

2. Add them to script.js
   - Open `script.js`
   - Replace:
     - `https://YOUR-PROJECT-ID.supabase.co`
     - `YOUR-ANON-KEY`

3. Create tables in Supabase SQL editor

```sql
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  user_name text not null default 'Guest',
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_name text not null default 'Guest',
  message text not null,
  created_at timestamptz not null default now()
);

alter table comments enable row level security;
alter table contact_messages enable row level security;
alter table chat_messages enable row level security;

create policy "Anyone can read comments" on comments for select using (true);
create policy "Anyone can insert comments" on comments for insert with check (true);

create policy "Anyone can read contact_messages" on contact_messages for select using (true);
create policy "Anyone can insert contact_messages" on contact_messages for insert with check (true);

create policy "Anyone can read chat_messages" on chat_messages for select using (true);
create policy "Anyone can insert chat_messages" on chat_messages for insert with check (true);
```

4. Enable Authentication
   - In Supabase dashboard, open Authentication
   - Enable Email authentication
   - Optionally enable Google login later

5. Deploy the site
   - Commit these changes to GitHub
   - In the repo settings, enable GitHub Pages
   - Deploy from the main branch

Important:
- This is a starter implementation.
- It will work once your Supabase keys and tables are in place.
- You can later upgrade it with real user profiles, moderation, admin dashboard, and custom chat rooms.
