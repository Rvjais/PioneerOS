'use client'

import { useState } from 'react'
import { PersonalStep } from './steps/PersonalStep'
import { WorkStep } from './steps/WorkStep'
import { DocumentsStep } from './steps/DocumentsStep'
import { ToolsStep } from './steps/ToolsStep'
import { PolicyStep } from './steps/PolicyStep'
import { saveWizardStep, submitForVerification } from './actions'

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  dateOfBirth: string
  bloodGroup: string
  address: string
  onboardingStep: number
}

interface ProfileData {
  emergencyContactName: string
  emergencyContactPhone: string
  panCard: string
  aadhaar: string
  panCardUrl: string
  aadhaarUrl: string
  bankDetailsUrl: string
  educationCertUrl: string
  linkedIn: string
  skills: string
  bio: string
  employeeHandbookAccepted: boolean
  socialMediaPolicyAccepted: boolean
  clientConfidentialityAccepted: boolean
  profilePicture: string
}

interface Props {
  user: UserData
  profile: ProfileData | null
}

const steps = [
  { id: 1, name: 'Personal Details', description: 'Basic information' },
  { id: 2, name: 'Work Details', description: 'Professional info' },
  { id: 3, name: 'Documents', description: 'Upload documents' },
  { id: 4, name: 'Tools Access', description: 'Confirm tools' },
  { id: 5, name: 'Policies', description: 'Accept & sign' },
]

export function ProfileWizard({ user, profile }: Props) {
  const [currentStep, setCurrentStep] = useState(user.onboardingStep || 1)
  const [formData, setFormData] = useState({
    // Personal
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    bloodGroup: user.bloodGroup,
    address: user.address,
    emergencyContactName: profile?.emergencyContactName || '',
    emergencyContactPhone: profile?.emergencyContactPhone || '',
    profilePicture: profile?.profilePicture || '',
    // Work
    department: user.department,
    linkedIn: profile?.linkedIn || '',
    skills: profile?.skills || '',
    bio: profile?.bio || '',
    // Documents
    panCard: profile?.panCard || '',
    aadhaar: profile?.aadhaar || '',
    panCardUrl: profile?.panCardUrl || '',
    aadhaarUrl: profile?.aadhaarUrl || '',
    bankDetailsUrl: profile?.bankDetailsUrl || '',
    educationCertUrl: profile?.educationCertUrl || '',
    // Tools
    toolsConfirmed: false,
    // Policies
    employeeHandbookAccepted: profile?.employeeHandbookAccepted || false,
    socialMediaPolicyAccepted: profile?.socialMediaPolicyAccepted || false,
    clientConfidentialityAccepted: profile?.clientConfidentialityAccepted || false,
    signature: '',
    selfieImage: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const getValidationErrors = (step: number): string[] => {
    const errors: string[] = []
    switch (step) {
      case 1:
        if (!formData.profilePicture) errors.push('Profile picture is required')
        if (!formData.firstName) errors.push('First name is required')
        if (!formData.email) errors.push('Email is required')
        if (!formData.dateOfBirth) errors.push('Date of birth is required')
        if (!formData.bloodGroup) errors.push('Blood group is required')
        if (!formData.address) errors.push('Current address is required')
        if (!formData.emergencyContactName) errors.push('Emergency contact name is required')
        if (!formData.emergencyContactPhone) errors.push('Emergency contact phone is required')
        break
      case 2:
        if (!formData.linkedIn) errors.push('LinkedIn profile URL is required')
        if (!formData.skills) errors.push('Skills are required')
        if (!formData.bio) errors.push('Short bio is required')
        break
      case 3:
        if (!formData.panCard) errors.push('PAN card number is required')
        if (!formData.aadhaar) errors.push('Aadhaar number is required')
        if (!formData.panCardUrl) errors.push('PAN card document upload is required')
        if (!formData.aadhaarUrl) errors.push('Aadhaar card document upload is required')
        if (!formData.bankDetailsUrl) errors.push('Bank details document upload is required')
        break
      case 4:
        if (!formData.toolsConfirmed) errors.push('Please confirm you have access to the required tools')
        break
      case 5:
        if (!formData.employeeHandbookAccepted) errors.push('Please accept the Employee Handbook')
        if (!formData.socialMediaPolicyAccepted) errors.push('Please accept the Social Media Policy')
        if (!formData.clientConfidentialityAccepted) errors.push('Please accept the Client Confidentiality Agreement')
        if (!formData.signature) errors.push('Please provide your digital signature')
        break
    }
    return errors
  }

  const isStepValid = (step: number) => {
    return getValidationErrors(step).length === 0
  }

  const handleNext = async () => {
    const errors = getValidationErrors(currentStep)
    if (errors.length > 0) {
      setError(errors.join('\n'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await saveWizardStep(currentStep, formData)

      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1)
      }
    } catch (err) {
      setError('Failed to save progress. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      await submitForVerification(formData)
      window.location.href = '/pending-verification'
    } catch (err) {
      setError('Failed to submit for verification. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  currentStep >= step.id ? 'text-white' : 'text-slate-400'
                }`}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 lg:w-24 h-1 mx-2 rounded ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-card rounded-2xl shadow-none p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            {steps[currentStep - 1].name}
          </h2>
          <p className="text-slate-300 mt-1">
            {steps[currentStep - 1].description}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-200 rounded-lg text-red-400">
            <p className="font-medium mb-1">Please fix the following:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {error.split('\n').map((e, i) => (
                <li key={`error-${i}`}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-8">
          {currentStep === 1 && (
            <PersonalStep data={formData} onChange={updateFormData} />
          )}
          {currentStep === 2 && (
            <WorkStep data={formData} onChange={updateFormData} />
          )}
          {currentStep === 3 && (
            <DocumentsStep data={formData} onChange={updateFormData} />
          )}
          {currentStep === 4 && (
            <ToolsStep data={formData} onChange={updateFormData} />
          )}
          {currentStep === 5 && (
            <PolicyStep data={formData} onChange={updateFormData} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="px-6 py-3 text-slate-300 font-medium rounded-lg hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.signature || !formData.employeeHandbookAccepted || !formData.socialMediaPolicyAccepted || !formData.clientConfidentialityAccepted}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit for Verification
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 text-center text-slate-400 text-sm">
        Step {currentStep} of {steps.length} - {Math.round((currentStep / steps.length) * 100)}% complete
      </div>
    </div>
  )
}
