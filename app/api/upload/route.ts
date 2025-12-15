import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = path.join(process.cwd(), "public/uploads")

    await fs.mkdir(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const ext = file.type.split("/")[1]
    const filePath = path.join(uploadDir, `${fileName}.${ext}`)

    await fs.writeFile(filePath, buffer)

    return NextResponse.json({
      url: `/uploads/${fileName}.${ext}`,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
