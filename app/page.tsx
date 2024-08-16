'use client'

import { useState } from 'react'
import axios from 'axios'
import { PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/solid'

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [calculation, setCalculation] = useState('')
  const [response, setResponse] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!file) {
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

      setResponse(response.data.text)
      setCalculation(response.data.calculation)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  return (
    <div className='m-auto mt-64   '>
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
                  className='relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500'>
                  <span>Upload a requisition form </span>
                  <input
                    onChange={handleFileChange}
                    accept='application/pdf'
                    id='file-upload'
                    name='file-upload'
                    type='file'
                    className='sr-only'
                  />
                </label>
                <p className='pl-1'>or drag and drop</p>
              </div>
              <p className='text-xs leading-5 text-gray-600'>PDF</p>
            </div>
          </div>
        </div>
        <button
          type='submit'
          className=' flex space-x-2 justify-center items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
          <span>{!processing ? 'Upload PDF requisition' : 'Processing'}</span>
          {processing && <ArrowPathIcon className='w-6 animate-spin' />}
        </button>
      </form>
      {response && calculation !== '' && (
        <div>
          <p>{calculation}</p> <p className='text-red-300 text-lg'>{response}</p>{' '}
        </div>
      )}
    </div>
  )
}
