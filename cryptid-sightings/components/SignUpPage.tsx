'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../components/auth-provider';

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    aboutMe: '',
    birthday: '',
    profilePic: null as File | null,
    securityQuestion: 'mothers-maiden-name', // Default security question
    securityAnswer: '',
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    securityAnswer: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const securityQuestions = [
    { value: 'mothers-maiden-name', label: "What was your mother's maiden name?" },
    { value: 'first-pet-name', label: "What was your first pet's name?" },
    { value: 'first-car-model', label: "What was your first car model?" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        profilePic: e.target.files[0],
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Security answer validation
    if (!formData.securityAnswer) {
      newErrors.securityAnswer = 'Security answer is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the username (using email as username per your backend implementation)
      const username = formData.email.split('@')[0];
      
      // First, register the user
      const API_BASE_URL = 'http://localhost:8000';
      const registerResponse = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: username,
          security_question: formData.securityQuestion,
          security_answer: formData.securityAnswer
        }),
      });
      
      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.detail || 'Failed to create account');
      }
      
      // If registration was successful, upload profile information
      const userData = await registerResponse.json();
      const userId = userData.id;
      
      // Create form data for profile info
      const profileFormData = new FormData();
      profileFormData.append('user_id', userId.toString());
      profileFormData.append('full_name', `${formData.firstName} ${formData.lastName}`);
      
      if (formData.aboutMe) {
        profileFormData.append('about_me', formData.aboutMe);
      }
      
      if (formData.birthday) {
        profileFormData.append('birthday', formData.birthday);
      }
      
      if (formData.profilePic) {
        profileFormData.append('profile_pic', formData.profilePic);
      }
      
      // Upload profile information
      const profileResponse = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'POST',
        body: profileFormData,
      });
      
      if (!profileResponse.ok) {
        console.warn('Profile setup encountered an issue, but account was created.');
      }
      
      // Automatically log in the user
      await login(formData.email, formData.password);
      
      // Will redirect to map as handled by the auth provider on successful login
    } catch (error) {
      console.error('Sign up error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during sign up');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-black py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-center">Create an Account</h1>
              <p className="mt-2 text-sm text-gray-500 text-center">Join the Real Things Sightings community</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              <form onSubmit={handleSubmit} className="py-8 space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 bg-white border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                {/* Password */}
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 bg-white border ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 bg-white border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
                
                {/* First & Last Name - side by side */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 bg-white border ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="John"
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 bg-white border ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>
                
                {/* Security Question - NEW */}
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Security Information <span className="text-red-500">*</span></h3>
                  
                  <div className="mb-4">
                    <label htmlFor="securityQuestion" className="text-sm font-medium text-gray-700">
                      Security Question
                    </label>
                    <select
                      id="securityQuestion"
                      name="securityQuestion"
                      value={formData.securityQuestion}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {securityQuestions.map((question) => (
                        <option key={question.value} value={question.value}>
                          {question.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="securityAnswer" className="text-sm font-medium text-gray-700">
                      Answer
                    </label>
                    <input
                      type="text"
                      id="securityAnswer"
                      name="securityAnswer"
                      value={formData.securityAnswer}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 bg-white border ${
                        errors.securityAnswer ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Your answer"
                    />
                    {errors.securityAnswer && <p className="mt-1 text-sm text-red-600">{errors.securityAnswer}</p>}
                  </div>
                </div>
                
                {/* Optional Fields Section */}
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Optional Information</h3>
                  
                  {/* About Me */}
                  <div className="mb-4">
                    <label htmlFor="aboutMe" className="text-sm font-medium text-gray-700">
                      About Me
                    </label>
                    <textarea
                      id="aboutMe"
                      name="aboutMe"
                      value={formData.aboutMe}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  
                  {/* Birthday */}
                  <div className="mb-4">
                    <label htmlFor="birthday" className="text-sm font-medium text-gray-700">
                      Birthday
                    </label>
                    <input
                      type="date"
                      id="birthday"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  {/* Profile Picture */}
                  <div>
                    <label htmlFor="profilePic" className="text-sm font-medium text-gray-700">
                      Profile Picture
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 border border-gray-300 rounded-full overflow-hidden bg-gray-100">
                        {formData.profilePic ? (
                          <img 
                            src={URL.createObjectURL(formData.profilePic)} 
                            alt="Profile preview" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14.25c2.07 0 3.75-1.68 3.75-3.75S14.07 6.75 12 6.75 8.25 8.43 8.25 10.5s1.68 3.75 3.75 3.75zm0 1.5c-2.49 0-7.5 1.26-7.5 3.75v1.5h15v-1.5c0-2.49-5.01-3.75-7.5-3.75z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="relative">
                          <input
                            id="profilePic"
                            name="profilePic"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          <label
                            htmlFor="profilePic"
                            className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Choose File
                          </label>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          JPG, PNG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </form>
              
              <div className="py-4 text-sm text-center">
                <span className="text-gray-500">Already have an account?</span>{' '}
                <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;