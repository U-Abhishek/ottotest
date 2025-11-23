"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

function EditWorkflowContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [nodeLabel, setNodeLabel] = useState("")
  const [nodeDescription, setNodeDescription] = useState("")
  const [nodeParameters, setNodeParameters] = useState<string>("")

  useEffect(() => {
    const stepsParam = searchParams.get("steps")
    if (stepsParam) {
      try {
        const steps = JSON.parse(decodeURIComponent(stepsParam))
        const newNodes: Node[] = steps.map((step: any, index: number) => ({
          id: step.id || `step-${index}`,
          type: "default",
          position: step.position || { x: 250 * (index % 3), y: 100 * Math.floor(index / 3) },
          data: {
            label: step.label || step.name || `Step ${index + 1}`,
            description: step.description || "",
            parameters: step.parameters || {},
          },
        }))
        setNodes(newNodes)
      } catch (error) {
        console.error("Error parsing steps:", error)
      }
    }
  }, [searchParams, setNodes])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setNodeLabel(node.data.label)
    setNodeDescription(node.data.description || "")
    setNodeParameters(node.data.parameters ? JSON.stringify(node.data.parameters, null, 2) : "")
  }, [])

  const handleUpdateNode = () => {
    if (!selectedNode) return

    let parameters = {}
    try {
      parameters = nodeParameters ? JSON.parse(nodeParameters) : {}
    } catch (e) {
      alert("Invalid JSON format for parameters. Please use valid JSON format.")
      return
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: nodeLabel,
              description: nodeDescription,
              parameters: parameters,
            },
          }
        }
        return node
      })
    )
    setSelectedNode(null)
    setNodeLabel("")
    setNodeDescription("")
    setNodeParameters("")
  }

  const handleAddNode = () => {
    const newNode: Node = {
      id: `step-${Date.now()}`,
      type: "default",
      position: {
        x: Math.random() * 500,
        y: Math.random() * 400,
      },
      data: {
        label: "New Step",
        description: "",
        parameters: {},
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleDeleteNode = () => {
    if (!selectedNode) return
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    )
    setSelectedNode(null)
    setNodeLabel("")
    setNodeDescription("")
    setNodeParameters("")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <div className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={handleAddNode}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
            <Button
              variant="default"
              onClick={() => alert("Workflow saved!")}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          <div className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>

        {selectedNode && (
          <div className="w-80 border-l bg-card p-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle>Edit Step</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nodeLabel">Step Name</Label>
                  <Input
                    id="nodeLabel"
                    value={nodeLabel}
                    onChange={(e) => setNodeLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nodeDescription">Description</Label>
                  <Textarea
                    id="nodeDescription"
                    value={nodeDescription}
                    onChange={(e) => setNodeDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nodeParameters">Test Parameters (JSON)</Label>
                  <Textarea
                    id="nodeParameters"
                    value={nodeParameters}
                    onChange={(e) => setNodeParameters(e.target.value)}
                    rows={6}
                    placeholder='{"voltage": "3.3V ± 0.1V", "current": "max 500mA"}'
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter test parameters as JSON. Example: voltage, current, frequency, temperature ranges from spec sheet.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateNode} className="flex-1">
                    Update
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteNode}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EditWorkflowPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading workflow editor...</div>
      </div>
    }>
      <EditWorkflowContent />
    </Suspense>
  )
}

