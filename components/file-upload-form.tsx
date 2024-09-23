'use client'

import { useState } from 'react'
import axios from 'axios'
import { Upload, Loader, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TestResults from '@/components/TestResults'

interface TubeSummary {
  tubeType: string
  numTubes: number
  totalVolume: string
}

interface DetailedStep {
  title: string
  content: string[]
}

interface CalculationResult {
  tubeSummary: TubeSummary[]
  detailedSteps: DetailedStep[]
}

export function FileUploadFormComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [calculation, setCalculation] = useState<CalculationResult | null>(null)
  const [response, setResponse] = useState('')
  const [fileSelected, setFileSelected] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFileSelected(true)
      setFile(event.target.files[0])
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFileSelected(true)
    if (!file) {
      setFileSelected(false)
      alert('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setProcessing(true)
      const response = await axios.post('/api/req-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('File uploaded successfully:', response.data)
      setProcessing(false)
      setCalculation(response.data.calculation)
      setResponse(response.data)
    } catch (error) {
      console.error('Error uploading file:', error)
      setProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Upload Requisition Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                Requisition Form
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {fileSelected ? (
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>{fileSelected ? 'Change file' : 'Upload a file'}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
                    </label>
                    <p className="pl-1">{fileSelected ? file?.name : 'or drag and drop'}</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF up to 10MB</p>
                </div>
              </div>
            </div>
            <div>
              <Button
                type="submit"
                disabled={!fileSelected || processing}
                className="w-full flex justify-center items-center"
              >
                {processing ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Processing
                  </>
                ) : (
                  'Upload PDF requisition'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {response && calculation && (
        <div className="mt-8">
          <TestResults data={calculation} />
        </div>
      )}
    </div>
  )
}