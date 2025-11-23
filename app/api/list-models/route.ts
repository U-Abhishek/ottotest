import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const client = genAI as any
    
    // Try to list models using the SDK
    // Note: The SDK might not have a direct listModels method, so we'll try common model names
    const commonModels = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
    ]

    const availableModels: string[] = []
    
    for (const modelName of commonModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        // Try a simple test generation
        await model.generateContent("test")
        availableModels.push(modelName)
        break // If one works, use it
      } catch (error: any) {
        // Model not available, continue
        console.log(`Model ${modelName} not available: ${error.message}`)
      }
    }

    return NextResponse.json({ 
      availableModels,
      recommended: availableModels[0] || "none"
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to list models", details: String(error) },
      { status: 500 }
    )
  }
}

