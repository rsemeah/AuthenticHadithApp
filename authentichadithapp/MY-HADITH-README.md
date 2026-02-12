# My Hadith Feature

This feature allows users to save, organize, and share hadiths in custom folders with notes and collaboration features.

## Database Setup

Before using this feature, run the migration:

```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/996-my-hadith-tables.sql
```

This creates the following tables:
- `hadith_folders` - User-created folders for organizing hadiths
- `folder_collaborators` - Sharing and collaboration on folders
- `folder_comments` - Comments on saved hadiths
- Updates `saved_hadiths` table with new fields (folder_id, notes, highlights, etc.)

## Features

### 1. Folder Management
- Create custom folders with icons and colors
- Organize folders in a hierarchy (parent/child)
- Smart folders with auto-filtering
- Public/Private/Unlisted privacy settings

### 2. Save Hadiths
- Save hadiths to specific folders
- Add personal notes and highlights
- Tag hadiths for easy filtering
- Attach files to saved hadiths

### 3. Sharing & Collaboration
- Generate shareable links for public folders
- Invite collaborators with different roles (viewer, contributor, editor)
- Comment on saved hadiths
- Mention other users in comments

### 4. Offline Support
- Folders and saved hadiths are cached locally
- Works offline with SQLite
- Auto-sync when online

## File Structure

```
authentichadithapp/
├── types/my-hadith.ts              # TypeScript type definitions
├── lib/api/my-hadith.ts            # API functions for Supabase
├── hooks/useMyHadith.ts            # React Query hooks
├── lib/offline/sqlite-db.ts        # Offline caching (updated)
├── app/(tabs)/my-hadith.tsx        # Main My Hadith tab
├── app/my-hadith/
│   ├── create-folder.tsx           # Create folder screen
│   └── folder/[id].tsx             # Folder detail screen
├── components/my-hadith/
│   └── SaveHadithModal.tsx         # Modal for saving hadiths
└── supabase/migrations/
    └── 996-my-hadith-tables.sql    # Database migration
```

## Usage

### Creating a Folder
1. Navigate to "My Hadith" tab
2. Tap "+ New Folder"
3. Choose name, icon, color, and description
4. Tap "Create Folder"

### Saving a Hadith
1. Open any hadith detail screen
2. Tap "💾 Save" button
3. Optionally select a folder
4. Add notes if desired
5. Tap "Save"

### Sharing a Folder
1. Open a folder
2. Tap "Share" button
3. Share link is generated and copied

## API Functions

See `lib/api/my-hadith.ts` for all available functions:
- `getUserFolders(userId)` - Get user's folders
- `createFolder(folder)` - Create new folder
- `updateFolder(id, updates)` - Update folder
- `deleteFolder(id)` - Delete folder
- `saveHadithToFolder(hadithId, folderId, notes)` - Save hadith
- `updateSavedHadithNotes(id, notes)` - Update notes
- `getFolderHadiths(folderId)` - Get hadiths in folder
- `generateShareToken(folderId)` - Generate share link
- `getFolderByShareToken(token)` - Get shared folder
- `addComment(savedHadithId, comment)` - Add comment

## React Hooks

See `hooks/useMyHadith.ts` for all available hooks:
- `useFolders()` - Query user folders
- `useCreateFolder()` - Mutation to create folder
- `useUpdateFolder()` - Mutation to update folder
- `useDeleteFolder()` - Mutation to delete folder
- `useFolderHadiths(folderId)` - Query folder hadiths
- `useSaveHadith()` - Mutation to save hadith
- `useUpdateNotes()` - Mutation to update notes
