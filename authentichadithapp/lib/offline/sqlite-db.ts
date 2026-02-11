import * as SQLite from 'expo-sqlite'

const DB_NAME = 'authentic_hadith.db'

let db: SQLite.SQLiteDatabase | null = null

export async function initDatabase() {
  if (db) return db

  db = await SQLite.openDatabaseAsync(DB_NAME)

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_hadiths (
      id TEXT PRIMARY KEY,
      hadith_number TEXT,
      arabic_text TEXT,
      english_text TEXT,
      grade TEXT,
      collection_slug TEXT,
      narrator TEXT,
      cached_at INTEGER,
      popularity_score INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_collection ON cached_hadiths(collection_slug);
    CREATE INDEX IF NOT EXISTS idx_popularity ON cached_hadiths(popularity_score DESC);
  `)

  return db
}

export async function cacheHadith(hadith: any) {
  const database = await initDatabase()
  
  await database.runAsync(
    `INSERT OR REPLACE INTO cached_hadiths 
     (id, hadith_number, arabic_text, english_text, grade, collection_slug, narrator, cached_at, popularity_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      hadith.id,
      hadith.hadith_number,
      hadith.arabic_text,
      hadith.english_text,
      hadith.grade,
      hadith.collection_slug,
      hadith.narrator,
      Date.now(),
      hadith.popularity_score || 0,
    ]
  )
}

export async function getCachedHadith(id: string) {
  const database = await initDatabase()
  
  const result = await database.getFirstAsync(
    'SELECT * FROM cached_hadiths WHERE id = ?',
    [id]
  )
  
  return result
}

export async function getPopularHadiths(limit: number = 100) {
  const database = await initDatabase()
  
  const results = await database.getAllAsync(
    'SELECT * FROM cached_hadiths ORDER BY popularity_score DESC LIMIT ?',
    [limit]
  )
  
  return results
}

export async function clearCache() {
  const database = await initDatabase()
  await database.runAsync('DELETE FROM cached_hadiths')
}
