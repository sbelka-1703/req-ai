import { NextRequest, NextResponse } from 'next/server'
import { fromBuffer } from 'pdf2pic'
import { Buffer } from 'buffer'
import { PDFDocument } from 'pdf-lib' // Import pdf-lib for page count

import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
const openAi = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY // Ensure your API key is correctly set
})

const totalTubeVolume = [
  { tubeType: 'gel-barrier', totalVolume: 6 },
  { tubeType: 'lavender-top', totalVolume: 4 }
]

const testsReference = [
  {
    cptCode: '86140',
    testName: 'C-Reactive Protein (CRP), Quantitative',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    cptCode: '81001',
    testName: 'Urinalysis, Complete',
    tubeType: 'Vacutainer® red/yellow urine transport tube',
    volume: 10 // Volume in mL (typical)
  },
  {
    cptCode: '82550',
    testName: 'Creatine Kinase (CK), Total Serum',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    cptCode: '82306',
    testName: 'Vitamin D, 25-Hydroxy',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    cptCode: '86038',
    testName: 'ANA by IFA, Reflex to Titer and Pattern',
    tubeType: 'gel-barrier',
    volume: 2 // Volume in mL
  },
  {
    cptCode: '86235',
    testName: 'Antinuclear Antibodies (ANA)',
    tubeType: 'gel-barrier',
    volume: 2 // Volume in mL
  },
  {
    cptCode: '81374',
    testName: 'HLA B27 Disease Association',
    tubeType: 'lavender-top',
    volume: 3 // Volume in mL
  },
  {
    cptCode: '86200',
    testName: 'Anti-CCP (Cyclic Citrullinated Peptide) Antibodies',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    cptCode: '86635',
    testName: 'Coccidioides Abs, IgG/IgM',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    cptCode: '82164',
    testName: 'Angiotensin-Converting Enzyme',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    cptCode: '86160',
    testName: 'Complement C4, Serum',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    cptCode: '84550',
    testName: 'Uric Acid, Serum',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    cptCode: '86037',
    testName: 'ANCA Profile',
    tubeType: 'gel-barrier',
    volume: 2 // Volume in mL
  },
  {
    cptCode: '85025',
    testName: 'Complete Blood Count (CBC) With Differential',
    tubeType: 'lavender-top',
    volume: 1 // Volume in mL
  },
  {
    cptCode: '80053',
    testName: 'Comprehensive Metabolic Panel',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  }
]

// const documentText = `**LabCorp**

// **Specimen/Provider Information**
// Collection Date: 08/14/2024 @ 11:15
// Ordering Provider: Rizwan, Mian

// **Patient Information**
// Patient Name:
// Patient Id:
// SSN:
// Work Phone:

// **Billing Information**
// Primary Ins.: United HealthCare of all states
// Address: PO Box 740800
// City, St, Zip: Atlanta, GA 30374-0800
// Workers' Comp: 906317801-0
// Group#: 13352
// Emp / Grp Name:

// **Bill To: Third Party**
// Secondary Ins. Code:
// Secondary Ins. Address:
// City, St. Zip:
// Workers' Comp:
// Group#:
// Emp / Grp Name:
// Insured:
// Address:
// City, St. Zip:
// Relationship:

// **Guarantee Information**
// Name
// Address
// Sample Comment:

// **Profiles / Tests**
// | Order Code | CPT Code | Status   | Test Name                             | Transport Requirements    |
// |------------|----------|----------|---------------------------------------|---------------------------|
// | 006627     | 86140    | Routine  | C-Reactive Protein, Quant             | Room Temperature: Room Temperature |
// | 011832     | 82525    | Routine  | Creative Kinase Total. Serum          | Room Temperature: Room Temperature |
// | 061497     | 82306    | Routine  | Vitamin D, 25-Hydroxy                 | Room Temperature: Room Temperature |
// | 161497     | 86003    | Routine  | Antinuclear Antibodies, IF            | Room Temperature: Room Temperature |
// | 027492     | 86375    | Routine  | Signer's Ab, Anti-SSA/SS-B           | Room Temperature: Room Temperature |
// | 060294     | 81747    | Routine  | HLA B 27 Disease Association          | Room Temperature: Room Temperature |
// | 164065     | 86200    | Routine  | Rheumatoid Arthritis Profile          | Room Temperature: Room Temperature |

// **Authorization**
// Please sign and date
// I hereby authorize the release of medical information related to the services described hereon and authorize payment of charges for laboratory services that are provided.

// **Rizwan, Mian**
// **08/14/2024**

// **Patient Signature**
// Date

// [Link to app] https://app.kareo.com/labs-util/patient/179001234/labState/all

// ---

// Let me know if you need any further assistance!
// Sure! Here’s the extracted text from the document:

// ---

// **LabCorp**

// **Specimen/Provider Information**
// Collection Date: 08/02/2024
// Ordering Provider: Rizwan, M. 16:00
// Lab Reference#: 28397071
// UPIN / NPI: 1437380276

// **Patient Information**
// Patient Name:
// Patient Id:
// Date of Birth: 06/12/1973
// Work Phone:

// **Billing Information**
// Primary Ins. Code: United HealthCare of all states
// Address: PO Box 748000
// City, St. Zip: Atlanta, GA 30374-0800
// Worker's Comp: No
// Group: 1945672-01
// Emp / Grp Name:
// Address:
// City, St. Zip:
// Relationship:

// **Diagnosis Codes:** R53.82, R76.0, M25.59, M15.9

// **Guarantor Information**
// Name:
// Address:

// Sample Comment:

// ---

// **Profiles / Tests**
// | Order Code | CPT Code | Status | Test Name | Transport Requirements |
// |------------|----------|--------|-----------|-----------------------|
// | 006267     | 87410    | Routine | C-Reactive Protein, Quant | Room Temperature: Room Temperature |
// | 001362     | 82565    | Routine | Creative Kinase, Total Serum | Room Temperature: Room Temperature |
// | 164796     | 8633...  | Routine | Coccidioides Abs, IgG/IgM, EIA | Room Temperature: Room Temperature |
// | 164794     | 8636...  | Routine | Antinuclear Antibodies, IFA | Room Temperature: Room Temperature |
// | 001700     | 86235... | Routine | Signer's Ab, Anti-SLA, A/S-B | Room Temperature: Room Temperature |
// | 011016     | 82114    | Routine | Angiotensin-Converting Enzyme | Room Temperature: Room Temperature |
// | 001384     | 86160    | Routine | Complement C4, Serum | Room Temperature: Room Temperature |
// | 001950     | 86134    | Routine | Uric Acid, Serum | Room Temperature: Room Temperature |
// | 164605     | 86200    | Routine | Rheumatoid Arthritis Profile | Room Temperature: Room Temperature |
// | 163061     | 86037... | Routine | ANCA Profile | Room Temperature: Room Temperature |

// **Authorization - Please sign and date**
// I hereby authorize the release of medical information related to the services described herein and authorize payment of charges for laboratory services that are performed.

// **Date:** 08/12/2024
// **Patient Signature:**
// **Date:**

// ---

// **https://app.kareo.com/labs-util/patient/17920224/labState/all**
// Here's the extracted text from the document:

// ---

// **LabCorp**

// Specimen/Provider Information
// Collection Date: 08/13/2024 @ 12:45
// Ordering Provider: Rizwan, Mian

// **Patient Information**
// Patient Name:
// Patient Id:
// SSN:
// DOB: 07/26/1953
// Work Phone:

// **Billing Information**
// Primary Ins.: Humana
// Primary Ins. Address: P.O. Box 14601
// City St. Zip: Lexington, KY 40512-4601
// Workers Comp:
// Group: H68606778

// **Bill To: Third Party**
// Secondary Ins.:
// Secondary Ins. Address:
// City St. Zip:
// Workers Comp:
// Policy:
// Emp / Grp Name:
// Insured:
// Address:
// City St. Zip:
// Relationship:

// **Guarantor Information**
// Name:
// Address:
// Sample Comment:

// **Profiles / Tests**
// Order Code | CPT Code | Status | Test Name | Transport Requirements
// ------------ | -------- | ------ | --------- | ----------------------
// 005609 | 85325 | Routine | CBC with Differential/Platelet | Room Temperature
// 006267 | 86140 | Routine | C-Reactive Protein, Quant | Room Temperature
// 322000 | 80053 | Routine | Comp. Metabolic Panel (14) | Room Temperature
// 164798 | 86635 | Routine | Coccidioides Abs, IgG/IgM, EIA | Room Temperature
// 163061 | 86037 | Routine | ANCA Profile | Room Temperature

// Authorization - Please sign and date
// I hereby authorize the release of medical information related to the services described herein and authorize payment directly to LabCorp. I agree to assume responsibility for payment of charges for laboratory services that are not covered by my health insurance.

// Rizwan, Mian 08/13/2024
// Ordering Provider Electronic Signature: [Signature]
// Patient Signature: [Signature]

// [LINK]

// ---
// `

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file = data.get('file') as Blob

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' })
    }

    // Convert the file into a Buffer for pdf2pic
    const pdfBuffer = Buffer.from(await file.arrayBuffer())

    // Get the number of pages in the PDF (using pdf-lib)
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const numberOfPages = pdfDoc.getPageCount()

    // Convert the PDF to images using pdf2pic
    const images = await convertPdfToImages(pdfBuffer)

    // Check if the number of images matches the number of pages
    if (images.length !== numberOfPages) {
      console.error('Mismatch in image count and number of pages in the PDF')
      return NextResponse.json({ success: false, message: 'Mismatch in image count and number of pages in the PDF' })
    }

    const results = []
    const maxRetries = 3 // Set the maximum number of retries
    const processedPages = []

    // Send each image to OpenAI Vision API with retry mechanism
    for (const [index, image] of images.entries()) {
      let success = false
      let retries = 0

      while (!success && retries < maxRetries) {
        try {
          if (image) {
            const visionResult = await pdfToText(image)
            results.push(visionResult)
            processedPages.push(index)
            success = true // Mark success if the processing is successful
          }
        } catch (error) {
          console.error(`Error processing image for page ${index + 1} (attempt ${retries + 1}):`, error)
          retries++
        }
      }

      if (!success) {
        console.error(`Failed to process page ${index + 1} after ${maxRetries} retries.`)
      }
    }

    // Check if all pages were processed
    if (processedPages.length < numberOfPages) {
      console.error(`Processed ${processedPages.length} out of ${numberOfPages} pages.`)
      return NextResponse.json({ success: false, message: 'Some pages were not processed successfully.' })
    }

    const joinedResults = results.join('\n')
    console.log('text from pdf', joinedResults)

    const tubesAndVolumeNeeded = await textToTubeTypeAndVolume(joinedResults)
    console.log('tubesAndVolumeNeeded', tubesAndVolumeNeeded)

    const tubesNeeded = await totalTubesNeeded(tubesAndVolumeNeeded)

    return NextResponse.json({ success: true, calculation: tubesAndVolumeNeeded, text: tubesNeeded })
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
async function textToTubeTypeAndVolume(extractedText: string) {
  const prompt = `
    Given the following text that includes tests ordered and their corresponding CPT codes:

    1. Identify all test names and CPT codes from the text.
    2. For each test, match it with its corresponding tube type and volume using the provided reference list.
    3. Calculate the total volume required for each tube type.
    4. Determine the number of tubes required for each tube type by considering the total available volume of each tube from the provided totalTubeVolume list. If the total volume for a tube type exceeds its capacity, add another tube.

    Output the result in this format:

    Total Tubes Required by Type:
    - [tubeType]: [number of tubes] tubes (Total Volume: [total volume in mL])

    Example:
    - gel-barrier: 2 tubes (Total Volume: 9 mL)
    - lavender-top: 1 tube (Total Volume: 4 mL)

    Here is the reference list for the tests:
    ${JSON.stringify(testsReference)}

    Here is the reference list for totalTubeVolume:
    ${JSON.stringify(totalTubeVolume)}

    And here is the extracted text:
    ${extractedText}
  `

  try {
    const response = await openAi.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
    return response.choices[0].message.content
  } catch (error) {
    console.error('Error processing with OpenAI Vision:', error)
    throw error
  }
}

async function totalTubesNeeded(extractedText: string | null) {
  const prompt = `
   Output Total Tubes by type and nothing else.
   
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
    density: 300, // Increase density for higher image quality
    format: 'jpeg',
    width: 1024,
    height: 1024,
    quality: 100
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
