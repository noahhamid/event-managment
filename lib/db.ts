import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI!

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db("campushub")

  cachedClient = client
  cachedDb = db

  return { client, db }
}
