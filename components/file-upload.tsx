"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Upload, FileText, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function FileUpload() {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<string>("")

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    console.log("File selected:", file.name, file.size, file.type)
    setFileName(file.name)
    setUploadStatus("uploading")
    setUploadProgress(0)
    setErrorMessage("")
    setDebugInfo("")

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Create FormData and upload
      const formData = new FormData()
      formData.append("file", file)

      console.log("Sending upload request...")
      const response = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const responseText = await response.text()
      console.log("Response status:", response.status)
      console.log("Response text:", responseText)

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

        // Trigger insights refresh after successful upload
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText }
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${responseText}`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      const errorMsg = error instanceof Error ? error.message : "Upload failed"
      setErrorMessage(errorMsg)
      setDebugInfo(`Error details: ${errorMsg}`)
      setUploadProgress(0)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const resetUpload = () => {
    setUploadStatus("idle")
    setUploadProgress(0)
    setFileName("")
    setErrorMessage("")
    setDebugInfo("")
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          uploadStatus === "success" && "border-green-500 bg-green-50",
          uploadStatus === "error" && "border-red-500 bg-red-50",
        )}
      >
        <input {...getInputProps()} />

        {uploadStatus === "idle" && (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? "Drop your CSV file here" : "Upload Salesforce CSV"}
            </p>
            <p className="text-sm text-gray-500">Drag and drop your CSV file here, or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">Maximum file size: 10MB</p>
          </>
        )}

        {uploadStatus === "uploading" && (
          <>
            <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Uploading {fileName}</p>
            <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
            <p className="text-sm text-gray-500 mt-2">{uploadProgress}% complete</p>
          </>
        )}

        {uploadStatus === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-green-700 mb-2">Upload Successful!</p>
            <p className="text-sm text-gray-600">{fileName} has been uploaded to Google Sheets</p>
            <p className="text-xs text-gray-500 mt-2">Insights will be generated shortly...</p>
          </>
        )}

        {uploadStatus === "error" && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-red-700 mb-2">Upload Failed</p>
            <p className="text-sm text-gray-600">Please check the error details below</p>
          </>
        )}
      </div>

      {uploadStatus === "error" && errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Error:</strong> {errorMessage}
              </p>
              {debugInfo && <p className="text-xs opacity-75">{debugInfo}</p>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {debugInfo && uploadStatus === "success" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{debugInfo}</AlertDescription>
        </Alert>
      )}

      {(uploadStatus === "success" || uploadStatus === "error") && (
        <Button onClick={resetUpload} variant="outline" className="w-full">
          Upload Another File
        </Button>
      )}
    </div>
  )
}
