import { fromBuffer } from 'pdf2pic'

export async function convertPdfToImages(pdfBuffer: Buffer) {
  const options = {
    density: 200, // Reduce density for lower processing overhead
    format: 'jpeg',
    width: 800, // Reduce dimensions to reduce memory usage
    height: 800,
    quality: 80 // Lower quality to reduce memory usage
  }

  const converter = fromBuffer(pdfBuffer, options)

  try {
    const images = await converter.bulk(-1, { responseType: 'buffer' })
    return images.map((image) => image.buffer)
  } catch (error) {
    console.error('Error converting PDF to images:', error)
    throw new Error('PDF to image conversion failed.')
  }
}
