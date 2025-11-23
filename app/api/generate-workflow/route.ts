import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Configure runtime for Vercel
export const runtime = "nodejs"
export const maxDuration = 60 // 60 seconds max for Vercel Pro, 10s for Hobby
export const dynamic = "force-dynamic" // Ensure route is not statically generated
export const fetchCache = "force-no-store" // Disable caching

// GET handler for health check
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      status: "ok", 
      message: "Workflow generation API is running",
      hasApiKey: !!process.env.GEMINI_API_KEY,
      path: request.url,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "GET handler error", 
        details: String(error),
        path: request.url 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chatText = formData.get("chatText") as string
    const document = formData.get("document") as File | null

    if (!chatText) {
      return NextResponse.json(
        { error: "Chat text is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    const prompt = `You are a hardware testing workflow generator. Based on the following description${document ? " and the uploaded document/specification sheet" : ""}, generate a structured test workflow with multiple steps.

CRITICAL INSTRUCTION: If you are recommending a test, you MUST provide exact parameters for the test based on the specification sheet. Include specific values such as voltage levels, current limits, frequency ranges, timing parameters, temperature ranges, etc. that are specified in the documentation.

Description: ${chatText}

Generate a JSON array of workflow steps. Each step should have:
- id: unique identifier (e.g., "step-1")
- label: short name for the step (e.g., "Power On Test")
- description: detailed description of what to do in this step, including exact test parameters from the spec sheet
- type: type of test (e.g., "power", "gpio", "communication", "measurement")
- parameters: (REQUIRED) An object containing exact test parameters from the spec sheet, such as:
  - voltage: exact voltage values (e.g., "3.3V ± 0.1V")
  - current: exact current limits (e.g., "max 500mA")
  - frequency: exact frequency ranges (e.g., "1MHz to 10MHz")
  - temperature: operating temperature ranges (e.g., "-40°C to +85°C")
  - timing: timing parameters (e.g., "setup time: 10ns, hold time: 5ns")
  - Any other relevant parameters from the spec sheet

Return ONLY valid JSON in this format:
{
  "steps": [
    {
      "id": "step-1",
      "label": "Step Name",
      "description": "Detailed description with exact parameters",
      "type": "test-type",
      "parameters": {
        "voltage": "3.3V ± 0.1V",
        "current": "max 500mA",
        "frequency": "1MHz to 10MHz"
      },
      "position": {"x": 0, "y": 0}
    }
  ]
}`

    // Prepare the content to generate
    let contentToGenerate: string
    if (document) {
      // For now, extract text from document and include in prompt
      const buffer = await document.arrayBuffer()
      let documentText = ""
      
      // Try to extract text if it's a text file
      if (document.type?.includes("text") || document.name.endsWith(".txt")) {
        documentText = Buffer.from(buffer).toString("utf-8")
      } else {
        // For PDFs and other formats, inform user that full document processing
        // requires a multimodal model. For now, we'll use text-only.
        documentText = `[Document "${document.name}" was uploaded but full content extraction requires a multimodal model. Please describe the document content in your workflow description.]`
      }
      
      contentToGenerate = `${prompt}\n\nDocument content (if applicable):\n${documentText.substring(0, 5000)}`
    } else {
      contentToGenerate = prompt
    }

    // Try model names in order of preference - starting with gemini-2.5-flash
    const modelNamesToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-pro", 
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
    ]
    
    let result
    let lastError: any = null
    
    // Try each model until one works
    for (const modelName of modelNamesToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        result = await model.generateContent(contentToGenerate)
        break // Success, exit loop
      } catch (error: any) {
        lastError = error
        // If it's a 404, try next model
        if (error?.message?.includes("404") || error?.message?.includes("not found")) {
          console.log(`Model ${modelName} not available, trying next...`)
          continue
        }
        // If it's a different error (auth, rate limit, etc), throw it
        throw error
      }
    }
    
    if (!result) {
      throw new Error(`No available models found. Tried: ${modelNamesToTry.join(", ")}. Error: ${lastError?.message || "Unknown error"}. Please check your API key and ensure Generative Language API is enabled in Google Cloud Console.`)
    }
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    const workflowData = JSON.parse(jsonMatch[0])

    // Ensure positions are set
    const steps = workflowData.steps.map((step: any, index: number) => ({
      ...step,
      position: step.position || {
        x: 250 * (index % 3),
        y: 100 * Math.floor(index / 3),
      },
    }))

    return NextResponse.json({ steps })
  } catch (error: any) {
    console.error("Error generating workflow:", error)
    const errorMessage = error?.message || String(error)
    const errorDetails = error?.cause || error?.stack || ""
    return NextResponse.json(
      { 
        error: "Failed to generate workflow", 
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorDetails : undefined
      },
      { status: 500 }
    )
  }
}

