import { NextRequest, NextResponse } from 'next/server'
import { fromBuffer } from 'pdf2pic'
import axios from 'axios'
import { Buffer } from 'buffer'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file = data.get('file') as Blob

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' })
    }

    // Convert the file into a Buffer for pdf2pic
    const pdfBuffer = Buffer.from(await file.arrayBuffer())

    // Convert the PDF to images using pdf2pic
    const images = await convertPdfToImages(pdfBuffer)

    const results = []

    // Send each image to OpenAI Vision API
    for (const image of images) {
      if (image) {
        const visionResult = await processWithOpenAIVision(image)
        results.push(visionResult)
      }
    }

    // Combine all text results and return as a single response
    return NextResponse.json({ success: true, text: results.join('\n') })
  } catch (error) {
    console.error('Error processing with OpenAI Vision:', error)
    return NextResponse.json({ success: false, message: 'Processing failed' })
  }
}

// Function to send image to OpenAI Vision using Axios
async function processWithOpenAIVision(image: Buffer) {
  const apiKey = process.env.OPENAI_API_KEY

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images:analyze', // Replace with the correct OpenAI Vision endpoint
      image,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'image/jpeg' // Adjust based on image type
        }
      }
    )

    const text = response.data.text || '' // Extract the text from the response
    return text
  } catch (error) {
    console.error('OpenAI Vision API error:', error)
    throw error
  }
}

// Function to convert PDF to images (using pdf2pic)
async function convertPdfToImages(pdfBuffer: Buffer) {
  const options = {
    density: 100, // Image quality
    format: 'jpeg', // Output format
    width: 600, // Width of the output images
    height: 800 // Height of the output images
  }

  const converter = fromBuffer(pdfBuffer, options)

  // Convert all pages to images as buffers
  const images = await converter.bulk(-1, { responseType: 'buffer' }) // Use responseType: "buffer"

  return images.map((image) => image.buffer) // Extract the buffer from each image response
}
