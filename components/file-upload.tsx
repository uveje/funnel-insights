"use client"

import type React from "react"
import { useState } from "react"

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [debugInfo, setDebugInfo] = useState<string>("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setDebugInfo("Please select a file")
      return
    }

    setUploadStatus("uploading")
    setDebugInfo("Uploading...")

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const responseText = await response.text()

      if (response.ok) {
        const result = JSON.parse(responseText)
        setUploadStatus("success")
        setDebugInfo(`Uploaded ${result.rowCount} rows successfully`)

        // Generate insights after successful upload
        console.log("Triggering insights generation...")
        try {
          const insightsResponse = await fetch("/api/generate-insights", {
            method: "POST",
          })

          if (insightsResponse.ok) {
            const insightsResult = await insightsResponse.json()
            setDebugInfo(`Uploaded ${result.rowCount} rows and generated ${insightsResult.insightCount} insights`)
          } else {
            setDebugInfo(`Uploaded ${result.rowCount} rows successfully. Insights generation in progress...`)
          }
        } catch (insightsError) {
          console.error("Insights generation error:", insightsError)
          setDebugInfo(`Uploaded ${result.rowCount} rows successfully. Manual insights refresh may be needed.`)
        }

        // Refresh the page to show new insights
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else {
        setUploadStatus("error")
        setDebugInfo(`Upload failed: ${responseText}`)
      }
    } catch (error: any) {
      setUploadStatus("error")
      setDebugInfo(`Upload failed: ${error.message}`)
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploadStatus === "uploading"}>
        {uploadStatus === "uploading" ? "Uploading..." : "Upload"}
      </button>
      {debugInfo && <p>{debugInfo}</p>}
    </div>
  )
}

export default FileUpload
