"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Workflow, Zap } from "lucide-react"

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <main className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-lg bg-primary p-3">
              <Workflow className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">OttoTest</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate hardware test workflows using AI-powered LLMs. Create, edit, and manage test procedures with ease.
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Get Started
            </CardTitle>
            <CardDescription>
              Create a new workflow by describing your hardware test requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push("/workflow/new")}
            >
              Create Workflow
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI-Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Leverage Gemini API to generate comprehensive test workflows from natural language descriptions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visual Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Edit and visualize your test workflow as an interactive flowchart with drag-and-drop capabilities
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload technical documents to provide context and improve workflow generation accuracy
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
