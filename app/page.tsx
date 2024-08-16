'use client'

import { useState } from 'react'
import axios from 'axios'

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [response, setResponse] = useState('')

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
      // Use axios to send the formData to the API route
      const response = await axios.post('/api/req-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('File uploaded successfully:', response.data)
      setResponse(response.data.text)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type='file' onChange={handleFileChange} accept='application/pdf' />
        <button type='submit'>Upload PDF</button>
      </form>
      {response !== '' && <p>{response}</p>}
    </div>
  )
}
