#!/usr/bin/env node
// Usage: node scripts/test-delete-flow.js <SUPABASE_URL> <SERVICE_ROLE_KEY> <USER_UUID>
// Calls the delete_user_account RPC via service-role, then prints the archived snapshot.

const [,, supabaseUrl, serviceRoleKey, userId] = process.argv

if (!supabaseUrl || !serviceRoleKey || !userId) {
  console.error("Usage: node test-delete-flow.js <SUPABASE_URL> <SERVICE_ROLE_KEY> <USER_UUID>")
  process.exit(1)
}

async function main() {
  // Dynamic import so we don't need a build step
  const { createClient } = await import("@supabase/supabase-js")

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`\n--- Deleting account for user: ${userId} ---\n`)

  // 1. Call the archive+purge RPC
  const { error: rpcError } = await admin.rpc("delete_user_account", {
    p_user_id: userId,
  })

  if (rpcError) {
    console.error("RPC error:", rpcError)
    process.exit(1)
  }
  console.log("delete_user_account RPC succeeded.")

  // 2. Fetch the archived snapshot
  const { data: archived, error: fetchError } = await admin
    .from("archived_user_data")
    .select("*")
    .eq("user_id", userId)
    .order("archived_at", { ascending: false })
    .limit(1)
    .single()

  if (fetchError) {
    console.error("Failed to fetch archive:", fetchError)
  } else {
    console.log("\nArchived snapshot:")
    console.log(JSON.stringify(archived, null, 2))
  }

  // 3. Verify rows are gone from a few key tables
  for (const table of ["profiles", "saved_hadiths", "user_streaks", "user_learning_path_progress"]) {
    const { data, error } = await admin
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq(table === "profiles" ? "id" : "user_id", userId)

    if (error && error.code === "PGRST204") {
      // Table doesn't exist — skip
      continue
    }
    if (error) {
      console.log(`  ${table}: query error — ${error.message}`)
    } else {
      console.log(`  ${table}: ${data ? data.length : 0} remaining rows (expected 0)`)
    }
  }

  // 4. Optionally delete the auth user too
  console.log("\nDeleting auth user...")
  const { error: authErr } = await admin.auth.admin.deleteUser(userId)
  if (authErr) {
    console.error("Auth delete error:", authErr)
  } else {
    console.log("Auth user deleted.")
  }

  console.log("\n--- Done ---")
}

main().catch((err) => {
  console.error("Unexpected error:", err)
  process.exit(1)
})
