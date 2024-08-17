import React, { useState } from 'react'

interface TubeSummary {
  tubeType: string
  numTubes: number
  totalVolume: string
}

interface DetailedStep {
  title: string
  content: string[]
}

interface TestResultsProps {
  data: {
    tubeSummary: TubeSummary[]
    detailedSteps: DetailedStep[]
  }
}

const TestResults: React.FC<TestResultsProps> = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <div className='space-y-4 ml-2'>
      <h2 className='text-lg font-semibold'>Total Tubes Required by Type</h2>
      <ul className='list-disc list-inside space-y-1'>
        {data.tubeSummary.map((tube, idx) => (
          <li key={idx}>
            {tube.tubeType}: {tube.numTubes} tubes (Total Volume: {tube.totalVolume})
          </li>
        ))}
      </ul>

      <button
        className='rounded-md bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100'
        onClick={toggleDetails}>
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>

      {showDetails && (
        <div>
          {data.detailedSteps &&
            data.detailedSteps.map((step, index) => (
              <div key={index} className='bg-white shadow-md rounded-lg p-4 space-y-2'>
                <h3 className='text-md font-semibold'>{step.title}</h3>
                <ul className='list-disc list-inside space-y-1'>
                  {step.content.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default TestResults
