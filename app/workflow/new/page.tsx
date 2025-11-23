"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, Send, Loader2 } from "lucide-react"

interface WorkflowStep {
  id: string
  label: string
  type: string
  description?: string
  parameters?: Record<string, string | number>
  position: { x: number; y: number }
}

export default function NewWorkflowPage() {
  const router = useRouter()
  const [document, setDocument] = useState<File | null>(null)
  const [chatText, setChatText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0])
    }
  }

  const handleGenerateWorkflow = async () => {
    if (!chatText.trim()) {
      alert("Please enter a description for your workflow")
      return
    }

    setIsGenerating(true)
    try {
      const formData = new FormData()
      if (document) {
        formData.append("document", document)
      }
      formData.append("chatText", chatText)

      const response = await fetch("/api/generate-workflow", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}` 
          : errorData.error || `Failed to generate workflow: ${response.status}`
        console.error("API Error:", errorData)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (!data.steps || !Array.isArray(data.steps)) {
        throw new Error("Invalid response format from server")
      }
      
      setWorkflowSteps(data.steps)
      
      // Navigate to workflow editor with the generated steps
      router.push(`/workflow/edit?steps=${encodeURIComponent(JSON.stringify(data.steps))}`)
    } catch (error) {
      console.error("Error generating workflow:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate workflow. Please try again."
      alert(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
            <CardDescription>
              Upload a document and describe your hardware test requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="document">Upload Document (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {document && (
                  <span className="text-sm text-muted-foreground">
                    {document.name}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chatText">Describe Your Test Workflow</Label>
              <Textarea
                id="chatText"
                placeholder="Example: Test a Raspberry Pi GPIO board. First, check power supply voltage. Then test each GPIO pin by setting it high and reading the value. Finally, verify I2C communication..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleGenerateWorkflow}
              disabled={isGenerating || !chatText.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Workflow...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

