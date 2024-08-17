import { NextRequest, NextResponse } from 'next/server'
import { fromBuffer } from 'pdf2pic'
import { Buffer } from 'buffer'

import OpenAI from 'openai'
const openAi = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY // Ensure your API key is correctly set
})

const totalTubeVolume = [
  { tubeType: 'gel-barrier', totalVolume: 6 },
  { tubeType: 'lavender-top', totalVolume: 4 }
]

const testsReference = [
  {
    orderCode: '006627',
    testName: 'C-Reactive Protein (CRP), Quantitative',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    orderCode: '377036',
    testName: 'Urinalysis, Complete',
    tubeType: 'Vacutainer® red/yellow urine transport tube',
    volume: 10 // Volume in mL (typical)
  },
  {
    orderCode: '001362',
    testName: 'Creatine Kinase (CK), Total Serum',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    orderCode: '081950',
    testName: 'Vitamin D, 25-Hydroxy',
    tubeType: 'gel-barrier',
    volume: 0.5 // Volume in mL
  },
  {
    orderCode: '164947',
    testName: 'ANA by IFA, Reflex to Titer and Pattern',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    orderCode: '164065',
    testName: 'Sjögren Antibodies (Anti-SS-A/Anti-SS-B)',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    orderCode: '006924',
    testName: 'HLA B27 Disease Association',
    tubeType: 'lavender-top',
    volume: 6 // Volume in mL
  },
  {
    orderCode: '164798',
    testName: 'Coccidioides Abs, IgG/IgM',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    orderCode: '010116',
    testName: 'Angiotensin-Converting Enzyme',
    tubeType: 'gel-barrier',
    volume: 0.5 // Volume in mL
  },
  {
    orderCode: '001834',
    testName: 'Complement C4, Serum',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    orderCode: '001057',
    testName: 'Uric Acid, Serum',
    tubeType: 'gel-barrier',
    volume: 1 // Volume in mL
  },
  {
    orderCode: '163061',
    testName: 'Antineutrophil Cytoplasmic Antibody (ANCA) Profile',
    tubeType: 'gel-barrier',
    volume: 3 // Volume in mL
  },
  {
    orderCode: '005009',
    testName: 'CBC With Differential/Platelet',
    tubeType: 'lavender-top',
    volume: 3 // Volume in mL
  },
  {
    orderCode: '322000',
    testName: 'Comprehensive Metabolic Panel',
    tubeType: 'gel-barrier',
    volume: 3 // Volume in mL
  },
  {
    orderCode: '005215',
    testName: 'Sedimentation Rate-Westergren',
    tubeType: 'lavender-top (EDTA)',
    volume: 2 // Volume in mL
  },
  {
    orderCode: '002030',
    testName: 'Aldolase',
    tubeType: 'red-top or gel-barrier',
    volume: 0.5 // Volume in mL
  },
  {
    orderCode: '144000',
    testName: 'Acute Hepatitis Panel',
    tubeType: 'gel-barrier',
    volume: 5 // Volume in mL
  },
  {
    orderCode: '001487',
    testName: 'Protein Electrophoresis, Serum',
    tubeType: 'gel-barrier',
    volume: 2 // Volume in mL
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
const documentText = `

**LabCorp**

Specimen/Provider Information
Collection Date: 08/13/2024 @ 12:45
Ordering Provider: Rizwan, Mian

**Patient Information**
Patient Name:
Patient Id:
SSN:
DOB: 07/26/1953
Work Phone:

**Billing Information**
Primary Ins.: Humana
Primary Ins. Address: P.O. Box 14601
City St. Zip: Lexington, KY 40512-4601
Workers Comp:
Group: H68606778

**Bill To: Third Party**
Secondary Ins.:
Secondary Ins. Address:
City St. Zip:
Workers Comp:
Policy:
Emp / Grp Name:
Insured:
Address:
City St. Zip:
Relationship:

**Guarantor Information**
Name:
Address:
Sample Comment:

**Profiles / Tests**
Order Code | CPT Code | Status | Test Name | Transport Requirements
------------ | -------- | ------ | --------- | ----------------------
005609 | 85325 | Routine | CBC with Differential/Platelet | Room Temperature
006267 | 86140 | Routine | C-Reactive Protein, Quant | Room Temperature
322000 | 80053 | Routine | Comp. Metabolic Panel (14) | Room Temperature
164798 | 86635 | Routine | Coccidioides Abs, IgG/IgM, EIA | Room Temperature
163061 | 86037 | Routine | ANCA Profile | Room Temperature

Authorization - Please sign and date
I hereby authorize the release of medical information related to the services described herein and authorize payment directly to LabCorp. I agree to assume responsibility for payment of charges for laboratory services that are not covered by my health insurance.

Rizwan, Mian 08/13/2024
Ordering Provider Electronic Signature: [Signature]
Patient Signature: [Signature]

// [LINK]

// ---
// `

export async function POST(request: NextRequest) {
  try {
    // Step 1: Retrieve and validate the uploaded file
    const data = await request.formData()
    const file = data.get('file') as Blob

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' })
    }

    // Step 2: Convert the file into a Buffer for processing
    let pdfBuffer
    try {
      pdfBuffer = Buffer.from(await file.arrayBuffer())
    } catch (bufferError) {
      console.error('Error converting file to buffer:', bufferError)
      return NextResponse.json({ success: false, message: 'Failed to process the uploaded file' })
    }

    // Step 3: Convert the PDF to images
    let images
    try {
      images = await convertPdfToImages(pdfBuffer)
    } catch (imageConversionError) {
      console.error('Error converting PDF to images:', imageConversionError)
      return NextResponse.json({ success: false, message: 'Failed to convert PDF to images' })
    }

    // Step 4: Process each image with OpenAI Vision API
    const results = []
    try {
      for (const image of images) {
        if (image) {
          try {
            const visionResult = await pdfToText(image)
            results.push(visionResult)
          } catch (visionError) {
            console.error('Error processing image with OpenAI Vision:', visionError)
            return NextResponse.json({ success: false, message: 'Failed to process image with OpenAI Vision' })
          }
        }
      }
    } catch (imageProcessingError) {
      console.error('Error during image processing loop:', imageProcessingError)
      return NextResponse.json({ success: false, message: 'Image processing failed' })
    }

    // Step 5: Join the results and process the text to determine tube types and volumes
    const joinedResults = results.join('\n')
    console.log('text from pdf', joinedResults)

    let tubesAndVolumeNeeded
    try {
      tubesAndVolumeNeeded = await textToTubeTypeAndVolume(joinedResults)
    } catch (textProcessingError) {
      console.error('Error processing text to determine tubes and volumes:', textProcessingError)
      return NextResponse.json({ success: false, message: 'Failed to process text for tubes and volumes' })
    }

    console.log('tubesAndVolumeNeeded', tubesAndVolumeNeeded)

    return NextResponse.json({ success: true, calculation: tubesAndVolumeNeeded })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ success: false, message: 'Processing failed due to an unexpected error' })
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
            {
              type: 'text',
              text: 'Your job is to find Profiles / Tests in this document and only extract that information (Order code, status, Test Name, and Transport Requirements). Double-check if all the tests are extracted accurately.'
            },
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
    Given the following text that includes tests ordered and their corresponding order codes:

    1. Identify all test names and order codes from the text, make sure you get all of the tests, by checking the number of tests in the text.
    2. For each test, match it with its corresponding tube type and volume using the provided reference list.
    3. Calculate the total volume required for each tube type.
    4. By looking at ${totalTubeVolume} determine amount of tubes needed. Think step by step. If the total volume for all the tests exceeds the capacity of a specific tube add another tube:
        Example:
        -If the total volume for a specific container is 5L, but the capacity of container is only 1L, you need 5 containers.
        -If a total volume for a specific container is 7.5ml. but the capacity of container is 2ml -- you would need 4 containers. 7.5 / 2 = 3.75; You cannot have 3.75 containers so you round it to 4 containers.
    5. For tubeSummary always take information for number of tubes from detailedSteps Step 4 and total volume from step 3. 

    Output the result as a JSON object structured with the following keys, your only output should be a pure JavaScript json object and nothing else, it should start with { end with }, do not use delimeters json :

    {
      "success": true,
      
      "detailedSteps": [
        
        {
          "title": "Step 1: Identify all test names and order codes",
          "content": [
            "Test Name 1 - Order Code 1",
            "Test Name 2 - Order Code 2",
            ...
          ]
        },
        {
          "title": "Step 2: Match each test with its corresponding tube type and volume",
          "content": [
            "Test Name 1 - Tube Type: [tubeType], Volume: [volume]",
            ...
          ]
        },
        {
          "title": "Step 3: Calculate the total volume required for each tube type",
          "content": [
            "Tube Type: [tubeType], Total Volume: [total volume in mL]",
            ...
          ]
        },
        {
          "title": "Step 4: Give a detailed report of calculations performed by showing the math that got you the results for a specific tube and mention the total capacity of each tube ",
          "content": [
            Step 1: 
            Step 2:
            Step 3: 
            ...
          ]
        }
        {
          "title": "Step 5: Determine the number of tubes required for each tube type",
          "content": [
            "Tube Type: [tubeType], Number of Tubes: [number of tubes]",
            ...
          ]
        }
      ],
      "tubeSummary": [
        {
          "tubeType": "[tubeType]",
          "numTubes": [number of tubes],
          "totalVolume": "[total volume in mL]"
        },
        ...
      ],
    }

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
    if (response.choices[0].message.content) {
      return JSON.parse(response.choices[0].message.content)
    }
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

  // Convert all pages to images as buffers and return them directly
  const images = await converter.bulk(-1, { responseType: 'buffer' })
  return images.map((image) => image.buffer)
}
