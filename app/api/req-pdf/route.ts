import { NextRequest, NextResponse } from 'next/server'
import { fromBuffer } from 'pdf2pic'
import { Buffer } from 'buffer'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
const openAi = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY // Ensure your API key is correctly set
})
const tests = [
  {
    cptCode: '86140',
    testName: 'C-Reactive Protein (CRP), Quantitative',
    tubeType: 'gel-barrier',
    volume: 1, // Volume in mL
    container: 'Red-top tube or gel-barrier tube'
  },
  {
    cptCode: '81001',
    testName: 'Urinalysis, Complete',
    tubeType: 'gel-barrier',
    volume: 10, // Volume in mL (typical)
    container: 'Gel-barrier tube'
  },
  {
    cptCode: '82550',
    testName: 'Creatine Kinase (CK), Total',
    tubeType: 'gel-barrier',
    volume: 1, // Volume in mL
    container: 'Gel-barrier tube'
  },
  {
    cptCode: '82306',
    testName: 'Vitamin D, 25-Hydroxy',
    tubeType: 'gel-barrier',
    volume: 1, // Volume in mL
    container: 'Red-top tube or gel-barrier tube'
  },
  {
    cptCode: '86038',
    testName: 'ANA by IFA, Reflex to Titer and Pattern',
    tubeType: 'gel-barrier',
    volume: 2, // Volume in mL
    container: 'Red-top tube or gel-barrier tube'
  },
  {
    cptCode: '86235',
    testName: 'Antinuclear Antibodies (ANA)',
    tubeType: 'gel-barrier',
    volume: 2, // Volume in mL
    container: 'Red-top tube or gel-barrier tube'
  },
  {
    cptCode: '81374',
    testName: 'HLA B27 Disease Association',
    tubeType: 'lavender-top',
    volume: 3, // Volume in mL
    container: 'Lavender-top (EDTA) tube'
  },
  {
    cptCode: '86200',
    testName: 'Anti-CCP (Cyclic Citrullinated Peptide) Antibodies',
    tubeType: 'gel-barrier',
    volume: 1, // Volume in mL
    container: 'Red-top tube or gel-barrier tube'
  },
  {
    cptCode: '86635',
    testName: 'Coccidioides Abs, IgG/IgM',
    tubeType: 'gel-barrier',
    volume: 1, // Volume in mL
    container: 'Red-top tube or gel-barrier tube'
  },
  {
    cptCode: '82164',
    testName: 'Angiotensin-Converting Enzyme',
    tubeType: 'gel-barrier',
    volume: 1, // Volume in mL
    container: 'Gel-barrier tube'
  },
  {
    cptCode: '86160',
    testName: 'Complement C4, Serum',
    tubeType: 'gel-barrier',
    volume: 1, // Volume in mL
    container: 'Gel-barrier tube'
  },
  {
    cptCode: '84550',
    testName: 'Uric Acid, Serum',
    tubeType: 'gel-barrier',
    volume: 1, // Volume in mL
    container: 'Gel-barrier tube'
  },
  {
    cptCode: '86037',
    testName: 'ANCA Profile',
    tubeType: 'gel-barrier',
    volume: 2, // Volume in mL
    container: 'Gel-barrier tube'
  },
  {
    cptCode: '85025',
    testName: 'Complete Blood Count (CBC) With Differential',
    tubeType: 'lavender-top',
    volume: 1, // Volume in mL
    container: 'Lavender-top (EDTA) tube'
  },
  {
    cptCode: '80053',
    testName: 'Comprehensive Metabolic Panel',
    tubeType: 'gel-barrier',
    volume: 1, // Volume in mL
    container: 'Gel-barrier tube'
  },
  {
    cptCode: '86480',
    testName: 'QuantiFERON-TB Gold Plus',
    tubeType: 'gel-barrier',
    volume: 1, // Volume in mL
    container: 'Gel-barrier tube'
  }
]

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
        const visionResult = await pdfToText(image)
        results.push(visionResult)
      }
    }

    const tubesNeeded = await textToTubes(results.join('\n'))

    // Combine all text results and return as a single response
    return NextResponse.json({ success: true, text: tubesNeeded })
  } catch (error) {
    console.error('Error processing with OpenAI Vision:', error)
    return NextResponse.json({ success: false, message: 'Processing failed' })
  }
}

async function pdfToText(image: Buffer) {
  try {
    const response = await openAi.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all of the text' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image.toString('base64')}`
              }
            }
          ]
        }
      ]
    })
    return response.choices[0].message.content
  } catch (error) {
    console.error('Error processing with OpenAI Vision:', error)
    throw error
  }
}
async function textToTubes(extractedText: string) {
  const prompt = `
  Extract the following information from this text and ${tests}:

  1. List all the tests ordered on each lab request form.
  2. Given the tests, look up the tube and volume that is required.
  3. Based on the required tubes and volumes, calculate the total number of tubes needed and group them by tube type.
 


 Your only output should be this information and nothing else. Be super laconic. 
  Total Tubes Required by Type:
  -type of tube: [] tubes


  Replace "X" with the number of tubes for each tube type.
  
  Here is the text: 
  `
  try {
    const response = await openAi.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: prompt + extractedText }]
        }
      ]
    })
    return response.choices[0].message.content
  } catch (error) {
    console.error('Error processing with OpenAI Vision:', error)
    throw error
  }
}

// Function to convert PDF to images (using pdf2pic)
async function convertPdfToImages(pdfBuffer: Buffer) {
  const options = {
    density: 150, // Increase density for higher image quality
    format: 'jpeg', // Output format
    width: 1024, // Increase width for better detail
    height: 1024, // Increase height for better detail
    quality: 90 // Increase image quality to 90%
  }

  const converter = fromBuffer(pdfBuffer, options)

  // Convert all pages to images as buffers
  const images = await converter.bulk(-1, { responseType: 'buffer' })

  // Create a directory to store the images if it doesn't exist
  const outputDir = path.join(process.cwd(), 'output_images')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  // Save each image to the directory and return the file paths
  const imagePaths = images.map((image, index) => {
    const imagePath = path.join(outputDir, `image_${index + 1}.jpeg`)
    fs.writeFileSync(imagePath, image.buffer)
    return imagePath
  })

  console.log('Images saved at:', imagePaths)
  return images.map((image) => image.buffer) // Return the buffers as well
}
