import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import postgres from 'postgres'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') })

async function runMigrations() {
  const connectionString = process.env.SUPABASE_CONNECTION_STRING

  if (!connectionString) {
    console.error('\n❌ Error: SUPABASE_CONNECTION_STRING is not set in .env.local')
    console.error('\n📋 To get your connection string:')
    console.error('   1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database')
    console.error('   2. Find the "Connection string" section')
    console.error('   3. Select "Connection pooling" or "Session mode"')
    console.error('   4. Copy the URI format connection string')
    console.error('   5. Add it to your .env.local file as SUPABASE_CONNECTION_STRING')
    console.error('\n   Example format:')
    console.error('   SUPABASE_CONNECTION_STRING=postgresql://postgres.xyz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres\n')
    process.exit(1)
  }

  const sql = postgres(connectionString)

  try {
    console.log('🔄 Running migrations...\n')

    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      console.log(`📄 Running migration: ${file}`)
      const migration = readFileSync(join(migrationsDir, file), 'utf8')

      try {
        await sql.unsafe(migration)
        console.log(`✅ Successfully applied: ${file}`)
      } catch (error) {
        console.error(`❌ Error in ${file}:`, error)
        throw error
      }
    }

    console.log('\n✅ All migrations completed successfully!')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

runMigrations()
