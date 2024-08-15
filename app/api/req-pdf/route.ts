import { NextRequest, NextResponse } from 'next/server'
import { fromBuffer } from 'pdf2pic'
import { Buffer } from 'buffer'
import OpenAI from 'openai'

const openAi = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY // Ensure your API key is correctly set
})

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

// Function to send image to OpenAI Vision API
async function processWithOpenAIVision(image: Buffer) {
  let retryCount = 0
  const maxRetries = 5

  while (retryCount < maxRetries) {
    try {
      const response = await openAi.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '1.Given the tests, look up the tube and volume that is required 2.Given all the tubes (and volume) required, calculate how many tubes we need'
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${image.toString('base64')}` }
              }
            ]
          }
        ]
      })
      return response.choices[0].message.content
    } catch (error) {
      // if (error.status === 429) {
      console.error('Error processing with OpenAI Vision:', error)
      throw error
    }
  }

  throw new Error('Max retries reached')
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
  const images = await converter.bulk(-1, { responseType: 'buffer' })

  return images.map((image) => image.buffer) // Extract the buffer from each image response
}
