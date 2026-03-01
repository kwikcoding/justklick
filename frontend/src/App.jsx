import { memo, useCallback, useMemo, useReducer, useState } from 'react'

// ============================================
// API Configuration
// ============================================
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://justklick.co.in/api' : 'http://localhost:8000/api')

// ============================================
// Form Reducer - Centralized State Management
// ============================================
const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_ARRAY_FIELD': {
      const { field, value, checked } = action
      return {
        ...state,
        [field]: checked
          ? [...state[field], value]
          : state[field].filter(item => item !== value)
      }
    }
    case 'RESET':
      return { ...action.payload }
    default:
      return state
  }
}

// ============================================
// Initial Form Data
// ============================================
const createInitialFormData = (mobileNumber = '') => ({
  // Personal Information
  fullName: '',
  fatherName: '',
  email: '',
  mobileNumber,
  gender: '',

  // Academic Information
  collegeCode: '',
  department: '',
  academicYear: '',
  yearOfStudy: '',
  cgpa: '',

  // Course Interest & Skills
  reasonForCourse: [],
  areaOfInterest: [],
  skillsToDevelop: [],

  // Future Plans
  planAfterGraduation: '',
  interestedInAbroad: '',
  preferredCountry: '',
  careerGoalType: '',

  // Additional Information
  internshipCompleted: '',
  interestedInInternship: '',
  hasCertifications: ''
})

// ============================================
// Memoized Input Component - True Controlled
// ============================================
const TextInput = memo(({
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  className,
  readOnly
}) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={className}
    readOnly={readOnly}
  />
))
TextInput.displayName = 'TextInput'

// ============================================
// Memoized Select Component
// ============================================
const SelectInput = memo(({
  name,
  value,
  onChange,
  options,
  required,
  className,
  disabled
}) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    className={className}
    disabled={disabled}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
))
SelectInput.displayName = 'SelectInput'

// ============================================
// Memoized Checkbox Group Component
// ============================================
const CheckboxGroup = memo(({
  label,
  fieldName,
  options,
  selectedValues,
  onChange
}) => (
  <div className="mb-8">
    <label className="block text-sm font-medium text-gray-700 mb-4">
      {label} <span className="text-gray-500">(Multiple Selection Allowed)</span>
    </label>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer transition duration-200"
        >
          <input
            type="checkbox"
            value={option}
            checked={selectedValues.includes(option)}
            onChange={(e) => onChange(e, fieldName)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="ml-3 text-sm text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  </div>
))
CheckboxGroup.displayName = 'CheckboxGroup'

// ============================================
// Memoized Radio Group Component
// ============================================
const RadioGroup = memo(({
  label,
  name,
  options,
  selectedValue,
  onChange,
  required,
  colorClass = 'orange'
}) => {
  const colorClasses = {
    orange: 'text-orange-600 focus:ring-orange-500',
    teal: 'text-teal-600 focus:ring-teal-500'
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex space-x-8">
        {options.map((option) => (
          <label key={option} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={selectedValue === option}
              onChange={onChange}
              required={required}
              className={`w-4 h-4 border-gray-300 ${colorClasses[colorClass]}`}
            />
            <span className="ml-2 text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  )
})
RadioGroup.displayName = 'RadioGroup'

// ============================================
// Section Header Component
// ============================================
const SectionHeader = memo(({ number, title, colorClass }) => {
  const bgColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500'
  }

  return (
    <div className="flex items-center mb-6">
      <div className={`w-10 h-10 ${bgColors[colorClass]} rounded-full flex items-center justify-center text-white font-bold mr-3`}>
        {number}
      </div>
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    </div>
  )
})
SectionHeader.displayName = 'SectionHeader'

// ============================================
// Alert Component
// ============================================
const Alert = memo(({ type, message }) => {
  const styles = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700'
  }

  const icons = {
    success: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  }

  return (
    <div className={`mb-6 p-4 ${styles[type]} border rounded-lg flex items-center`}>
      {icons[type]}
      {message}
    </div>
  )
})
Alert.displayName = 'Alert'

// ============================================
// Loading Spinner Component
// ============================================
const Spinner = memo(({ className = 'h-5 w-5' }) => (
  <svg className={`animate-spin -ml-1 mr-3 ${className} text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
))
Spinner.displayName = 'Spinner'

// ============================================
// Login Screen Component (simplified - no OTP)
// ============================================
const LoginScreen = memo(({
  mobileNumber,
  onMobileChange,
  onContinue
}) => (
  <div className="min-h-screen  flex items-center justify-center py-4 px-4"

    style={{
      backgroundImage: "url('https://plus.unsplash.com/premium_photo-1691962725044-d80a7145f7ee?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}

  >
    <div className="max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Student Details Form
        </h1>
        <p className="text-white">Enter your mobile number to continue</p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                +91
              </span>
              <input
                type="tel"
                value={mobileNumber}
                onChange={onMobileChange}
                placeholder="Enter 10-digit mobile number"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
          </div>

          <button
            onClick={onContinue}
            disabled={mobileNumber.length !== 10}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Continue to Form
            </span>
          </button>
        </div>
      </div>

    </div>

    {/* Footer */}

  </div>
))
LoginScreen.displayName = 'LoginScreen'

// ============================================
// Student Form Component (moved outside App)
// ============================================
const StudentForm = memo(({
  formData,
  submitted,
  error,
  isSubmitting,
  selectOptions,
  checkboxOptions,
  inputClass,
  selectClass,
  futureSelectClass,
  onFieldChange,
  onCheckboxChange,
  onSubmit,
  onReset
}) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Student Details Form
        </h1>
        <p className="text-gray-600">Please fill in all the required information accurately</p>
      </div>

      {submitted && <Alert type="success" message="Form submitted successfully!" />}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <SectionHeader number={1} title="Personal Information" colorClass="blue" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <TextInput
                name="fullName"
                value={formData.fullName}
                onChange={onFieldChange}
                required
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Father's Name <span className="text-red-500">*</span>
              </label>
              <TextInput
                name="fatherName"
                value={formData.fatherName}
                onChange={onFieldChange}
                required
                className={inputClass}
                placeholder="Enter father's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ID <span className="text-red-500">*</span>
              </label>
              <TextInput
                type="email"
                name="email"
                value={formData.email}
                onChange={onFieldChange}
                required
                className={inputClass}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <TextInput
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={onFieldChange}
                required
                className={inputClass}
                placeholder="Enter 10-digit mobile number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-8">
                {['Male', 'Female'].map((option) => (
                  <label key={option} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={formData.gender === option}
                      onChange={onFieldChange}
                      required
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <SectionHeader number={2} title="Academic Information" colorClass="green" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College Code <span className="text-red-500">*</span>
              </label>
              <TextInput
                name="collegeCode"
                value={formData.collegeCode}
                onChange={onFieldChange}
                required
                className={selectClass}
                placeholder="Enter college code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department / Course <span className="text-red-500">*</span>
              </label>
              <SelectInput
                name="department"
                value={formData.department}
                onChange={onFieldChange}
                options={selectOptions.department}
                required
                className={selectClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <SelectInput
                name="academicYear"
                value={formData.academicYear}
                onChange={onFieldChange}
                options={selectOptions.academicYear}
                required
                className={selectClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Study <span className="text-red-500">*</span>
              </label>
              <SelectInput
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={onFieldChange}
                options={selectOptions.yearOfStudy}
                required
                className={selectClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current CGPA / Percentage <span className="text-red-500">*</span>
              </label>
              <SelectInput
                name="cgpa"
                value={formData.cgpa}
                onChange={onFieldChange}
                options={selectOptions.cgpa}
                required
                className={selectClass}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Course Interest & Skills */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <SectionHeader number={3} title="Course Interest & Skills" colorClass="purple" />

          <CheckboxGroup
            label="Reason for Choosing This Course"
            fieldName="reasonForCourse"
            options={checkboxOptions.reasonForCourse}
            selectedValues={formData.reasonForCourse}
            onChange={onCheckboxChange}
          />

          <CheckboxGroup
            label="Area of Interest"
            fieldName="areaOfInterest"
            options={checkboxOptions.areaOfInterest}
            selectedValues={formData.areaOfInterest}
            onChange={onCheckboxChange}
          />

          <CheckboxGroup
            label="Skills Want to Develop"
            fieldName="skillsToDevelop"
            options={checkboxOptions.skillsToDevelop}
            selectedValues={formData.skillsToDevelop}
            onChange={onCheckboxChange}
          />
        </div>

        {/* Section 4: Future Plans */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <SectionHeader number={4} title="Future Plans" colorClass="orange" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan After Graduation <span className="text-red-500">*</span>
              </label>
              <SelectInput
                name="planAfterGraduation"
                value={formData.planAfterGraduation}
                onChange={onFieldChange}
                options={selectOptions.planAfterGraduation}
                required
                className={futureSelectClass}
              />
            </div>

            <RadioGroup
              label="Interested in Going Abroad?"
              name="interestedInAbroad"
              options={['Yes', 'No', 'Maybe']}
              selectedValue={formData.interestedInAbroad}
              onChange={onFieldChange}
              required
              colorClass="orange"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Country (If Abroad)
              </label>
              <SelectInput
                name="preferredCountry"
                value={formData.preferredCountry}
                onChange={onFieldChange}
                options={selectOptions.preferredCountry}
                className={futureSelectClass}
                disabled={formData.interestedInAbroad === 'No'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Career Goal Type <span className="text-red-500">*</span>
              </label>
              <SelectInput
                name="careerGoalType"
                value={formData.careerGoalType}
                onChange={onFieldChange}
                options={selectOptions.careerGoalType}
                required
                className={futureSelectClass}
              />
            </div>
          </div>
        </div>

        {/* Section 5: Additional Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <SectionHeader number={5} title="Additional Information" colorClass="teal" />

          <div className="space-y-6">
            <RadioGroup
              label="Internship Completed?"
              name="internshipCompleted"
              options={['Yes', 'No']}
              selectedValue={formData.internshipCompleted}
              onChange={onFieldChange}
              required
              colorClass="teal"
            />

            <RadioGroup
              label="Interested in Internship Opportunities?"
              name="interestedInInternship"
              options={['Yes', 'No']}
              selectedValue={formData.interestedInInternship}
              onChange={onFieldChange}
              required
              colorClass="teal"
            />

            <RadioGroup
              label="Have Certifications?"
              name="hasCertifications"
              options={['Yes', 'No']}
              selectedValue={formData.hasCertifications}
              onChange={onFieldChange}
              required
              colorClass="teal"
            />
          </div>
        </div>

        {/* Submit and Reset Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="flex items-center justify-center">
              {isSubmitting ? (
                <>
                  <Spinner />
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Form
                </>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-300 transform hover:scale-105 transition duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Form
            </span>
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-4">
        <p>© 2026 Student Details Form. All rights reserved.</p>
      </div>
    </div>
  </div>
))
StudentForm.displayName = 'StudentForm'

// ============================================
// Main App Component
// ============================================
function App() {
  // ============================================
  // Mobile Number State
  // ============================================
  const [mobileNumber, setMobileNumber] = useState('')

  // ============================================
  // Form State with Reducer
  // ============================================
  const [formData, dispatchForm] = useReducer(formReducer, createInitialFormData())
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // ============================================
  // Memoized Initial Form Data for Reset
  // ============================================
  const resetFormData = useMemo(() => createInitialFormData(mobileNumber), [mobileNumber])

  // ============================================
  // Stable Event Handlers with useCallback
  // ============================================
  const handleFieldChange = useCallback((e) => {
    const { name, value } = e.target
    dispatchForm({ type: 'SET_FIELD', field: name, value })
  }, [])

  const handleCheckboxChange = useCallback((e, fieldName) => {
    const { value, checked } = e.target
    dispatchForm({ type: 'SET_ARRAY_FIELD', field: fieldName, value, checked })
  }, [])

  const handleMobileChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setMobileNumber(value)
  }, [])

  const handleContinue = useCallback(() => {
    if (mobileNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number')
      return
    }
    dispatchForm({ type: 'SET_FIELD', field: 'mobileNumber', value: mobileNumber })
  }, [mobileNumber])

  const handleReset = useCallback(() => {
    dispatchForm({ type: 'RESET', payload: resetFormData })
  }, [resetFormData])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const transformedData = {
        ...formData,
        interestedInAbroad: formData.interestedInAbroad === 'Yes',
        internshipCompleted: formData.internshipCompleted === 'Yes',
        interestedInInternship: formData.interestedInInternship === 'Yes',
        hasCertifications: formData.hasCertifications === 'Yes',
        cgpa: parseFloat(formData.cgpa) || 0,
      }

      const response = await fetch(`${API_BASE_URL}/students/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || JSON.stringify(errorData) || 'Failed to submit form')
      }

      const result = await response.json()
      console.log('Form Data Submitted:', result)
      setSubmitted(true)
      handleReset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      console.error('Submission error:', err)
      setError(err.message || 'Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, handleReset])

  // ============================================
  // Memoized Options Data
  // ============================================
  const selectOptions = useMemo(() => ({
    department: [
      { value: '', label: '⬇ Select Course' },
      { value: 'B.Tech', label: 'B.Tech' },
      { value: 'B.Sc', label: 'B.Sc' },
      { value: 'B.Com', label: 'B.Com' },
      { value: 'BBA', label: 'BBA' },
      { value: 'BA', label: 'BA' },
      { value: 'M.Tech', label: 'M.Tech' },
      { value: 'M.Sc', label: 'M.Sc' },
      { value: 'MBA', label: 'MBA' },
      { value: 'MCA', label: 'MCA' },
      { value: 'Other', label: 'Other' }
    ],
    academicYear: [
      { value: '', label: 'Select Academic Year' },
      { value: '2023-2024', label: '2023–2024' },
      { value: '2024-2025', label: '2024–2025' },
      { value: '2025-2026', label: '2025–2026' },
      { value: '2026-2027', label: '2026–2027' },
      { value: 'Other', label: 'Other' }
    ],
    yearOfStudy: [
      { value: '', label: 'Select Year of Study' },
      { value: '1st Year', label: '1st Year' },
      { value: '2nd Year', label: '2nd Year' },
      { value: '3rd Year', label: '3rd Year' },
      { value: '4th Year', label: '4th Year' },
      { value: '5th Year', label: '5th Year' }
    ],
    cgpa: [
      { value: '', label: 'Select CGPA / Percentage Range' },
      { value: 'Below 60%', label: 'Below 60%' },
      { value: '60-70%', label: '60–70%' },
      { value: '70-80%', label: '70–80%' },
      { value: '80-90%', label: '80–90%' },
      { value: 'Above 90%', label: 'Above 90%' }
    ],
    planAfterGraduation: [
      { value: '', label: 'Select Plan After Graduation' },
      { value: 'Higher Studies in India', label: 'Higher Studies in India' },
      { value: 'Higher Studies Abroad', label: 'Higher Studies Abroad' },
      { value: 'Job in India', label: 'Job in India' },
      { value: 'Job Abroad', label: 'Job Abroad' },
      { value: 'Start a Business', label: 'Start a Business' },
      { value: 'Competitive Exams', label: 'Competitive Exams' },
      { value: 'Not Decided', label: 'Not Decided' }
    ],
    preferredCountry: [
      { value: '', label: 'Select Preferred Country' },
      { value: 'USA', label: 'USA' },
      { value: 'UK', label: 'UK' },
      { value: 'Canada', label: 'Canada' },
      { value: 'Australia', label: 'Australia' },
      { value: 'Germany', label: 'Germany' },
      { value: 'Other', label: 'Other' }
    ],
    careerGoalType: [
      { value: '', label: 'Select Career Goal Type' },
      { value: 'Technical Career', label: 'Technical Career' },
      { value: 'Management Career', label: 'Management Career' },
      { value: 'Research Career', label: 'Research Career' },
      { value: 'Government Sector', label: 'Government Sector' },
      { value: 'Business / Startup', label: 'Business / Startup' },
      { value: 'Undecided', label: 'Undecided' }
    ]
  }), [])

  const checkboxOptions = useMemo(() => ({
    reasonForCourse: ['Personal Interest', 'Family Suggestion', 'Job Opportunities', 'Business Purpose', 'Higher Studies Plan', 'Other'],
    areaOfInterest: ['Core Subjects', 'Research', 'Software / Technical', 'Management', 'Entrepreneurship', 'Government Jobs', 'Private Sector Jobs'],
    skillsToDevelop: ['Communication Skills', 'Technical Skills', 'Programming', 'Leadership', 'Problem Solving', 'Public Speaking', 'Analytical Skills']
  }), [])

  // ============================================
  // Input Class Names
  // ============================================
  const inputBaseClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition duration-200"
  const inputClass = `${inputBaseClass} hover:border-blue-400 focus:ring-blue-500`
  const selectClass = `${inputBaseClass} hover:border-green-400 focus:ring-green-500 bg-white`
  const futureSelectClass = `${inputBaseClass} hover:border-orange-400 focus:ring-orange-500 bg-white`

  // ============================================
  // Render based on mobile number state
  // ============================================
  const hasEnteredMobile = mobileNumber.length === 10

  return hasEnteredMobile ? (
    <StudentForm
      formData={formData}
      submitted={submitted}
      error={error}
      isSubmitting={isSubmitting}
      selectOptions={selectOptions}
      checkboxOptions={checkboxOptions}
      inputClass={inputClass}
      selectClass={selectClass}
      futureSelectClass={futureSelectClass}
      onFieldChange={handleFieldChange}
      onCheckboxChange={handleCheckboxChange}
      onSubmit={handleSubmit}
      onReset={handleReset}
    />
  ) : (
    <LoginScreen
      mobileNumber={mobileNumber}
      onMobileChange={handleMobileChange}
      onContinue={handleContinue}
    />
  )
}

export default App
