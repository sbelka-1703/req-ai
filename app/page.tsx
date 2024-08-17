'use client'

import { useState } from 'react'
import axios from 'axios'
import { PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
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

export default function FileUploadForm() {
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
      // Use axios to send the formData to the API route
      const response = await axios.post('/api/req-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('File uploaded successfully:', response.data)
      setProcessing(false)

      // Assuming the response.data is of the correct type
      setCalculation(response.data.calculation)
      setResponse(response.data)
      console.log('response', response)
      console.log('data', response.data)
    } catch (error) {
      console.error('Error uploading file:', error)
      setProcessing(false)
    }
  }

  return (
    <div className='m-auto mt-64 px-2'>
      <form className='flex flex-col' onSubmit={handleSubmit}>
        <div className='col-span-full'>
          <label htmlFor='cover-photo' className='block text-sm font-medium leading-6 text-gray-900'>
            Requisition from
          </label>
          <div className='mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10'>
            <div className='text-center'>
              <PhotoIcon aria-hidden='true' className='mx-auto h-12 w-12 text-gray-300' />
              <div className='mt-4 flex text-sm leading-6 text-gray-600'>
                <label
                  htmlFor='file-upload'
                  className={`relative cursor-pointer rounded-md bg-white font-semibold  focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 ${
                    fileSelected ? 'text-green-600' : 'text-indigo-600'
                  }`}>
                  <span>
                    {' '}
                    {!fileSelected ? 'Click here to select and upload a requisition form' : 'File selected!'}
                  </span>
                  <input
                    onChange={handleFileChange}
                    accept='application/pdf'
                    id='file-upload'
                    name='file-upload'
                    type='file'
                    className='sr-only'
                  />
                </label>
              </div>
              <p className='text-xs leading-5 text-gray-600'>PDF</p>
            </div>
          </div>
        </div>
        <button
          type='submit'
          disabled={!fileSelected}
          className={`flex space-x-2 justify-center items-center rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  ${
            fileSelected
              ? 'bg-indigo-600 hover:bg-indigo-500'
              : ' text-gray-200 bg-slate-500 focus-visible:bg-slate-500'
          } `}>
          <span>{!processing ? 'Upload PDF requisition' : 'Processing'}</span>
          {processing && <ArrowPathIcon className='w-6 animate-spin' />}
        </button>
      </form>
      {response && calculation && <TestResults data={calculation} />}
    </div>
  )
}
