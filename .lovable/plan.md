

## Current State

The app has authentication (signup, login, sign out) wired to Lovable Cloud's built-in auth system. Sign out buttons exist on both Landing and Workspace pages and call `signOut()` from AuthContext — these should already work. The `/workspace` route is not protected, so unauthenticated users can access it.

**Where users are stored**: Users are stored in Lovable Cloud's built-in authentication system (the `auth.users` table managed automatically). There is no custom `profiles` table yet — only the default auth table which stores email, password hash, and the `name` field passed via `user_metadata` during signup. No additional user data is persisted in a custom table.

## Plan

### 1. Fix sign-out redirect
After signing out, redirect the user to the landing page (`/`) instead of staying on the current page.

- **AuthContext.tsx**: Update `signOut` to not just call `supabase.auth.signOut()` — the redirect will be handled by consuming components or by adding a navigation callback.
- **Workspace.tsx** and **Landing.tsx**: After `signOut()`, navigate to `/`. The Landing page already handles this implicitly (UI updates via auth state), but Workspace should redirect. We'll wrap signOut to include navigation.

### 2. Protect the `/workspace` route
Add a simple auth guard so unauthenticated users visiting `/workspace` are redirected to `/login`.

- Create a `ProtectedRoute` wrapper component that checks `useAuth()` and redirects to `/login` if no user.
- Wrap the `/workspace` route with it in `App.tsx`.

### 3. Redirect authenticated users away from auth pages
If a logged-in user visits `/login` or `/signup`, redirect them to `/workspace`.

### 4. No database changes needed
Users are stored in Lovable Cloud's built-in auth system. No custom tables are required unless you want to store additional profile data (avatar, preferences, etc.). I'll ask about that during implementation if needed.

### Files to modify
- `src/contexts/AuthContext.tsx` — minor cleanup
- `src/App.tsx` — add `ProtectedRoute` wrapper
- `src/pages/Workspace.tsx` — add signOut with redirect
- `src/pages/Login.tsx` — redirect if already authenticated
- `src/pages/Signup.tsx` — redirect if already authenticated

