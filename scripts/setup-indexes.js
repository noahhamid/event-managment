const { MongoClient } = require("mongodb")

async function setupIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("campus_events")

    console.log("Creating MongoDB indexes for optimal performance...")

    // Users collection indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    console.log("✓ Created email index on users")

    await db.collection("users").createIndex({ username: 1 }, { unique: true, sparse: true })
    console.log("✓ Created username index on users")

    await db.collection("users").createIndex({ isVerified: 1 })
    console.log("✓ Created isVerified index on users")

    // Events collection indexes
    await db.collection("events").createIndex({ category: 1 })
    console.log("✓ Created category index on events")

    await db.collection("events").createIndex({ createdAt: -1 })
    console.log("✓ Created createdAt index on events")

    await db.collection("events").createIndex({ likesCount: -1 })
    console.log("✓ Created likesCount index on events")

    await db.collection("events").createIndex({ "comments.userId": 1 })
    console.log("✓ Created comments.userId index on events")

    console.log("\nAll indexes created successfully!")
    console.log("Your database is now optimized for fast queries.")
  } catch (error) {
    console.error("Error creating indexes:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

setupIndexes()
