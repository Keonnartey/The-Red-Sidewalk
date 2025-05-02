'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Step management for the password reset flow
type ResetStep = 'request' | 'security-question' | 'new-password' | 'success';

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ResetStep>('request');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: string; message: string } | null>(null);
  
  // Form data for each step
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [securityQuestion, setSecurityQuestion] = useState<string>('');
  const [securityAnswer, setSecurityAnswer] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const API_BASE_URL = 'http://localhost:8000';
  
  // Step 1: Request password reset by submitting email
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }
    
    setIsSubmitting(true);
    setStatus(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSecurityQuestion(data.security_question);
        setUsername(data.username);
        setCurrentStep('security-question');
        setStatus(null);
      } else {
        // Even if email doesn't exist, don't reveal that information
        // Pretend we sent a security question anyway
        setStatus({ 
          type: 'success', 
          message: 'If an account exists with this email, you will be prompted with a security question.' 
        });
        
        // In a real app, you might add a delay here to prevent timing attacks
        setTimeout(() => {
          if (response.status === 404) {
            // Simulate moving to next step even though account doesn't exist
            // This prevents user enumeration
            setSecurityQuestion('What was your first pet\'s name?');
            setCurrentStep('security-question');
          } else {
            setStatus({ 
              type: 'error', 
              message: 'Something went wrong. Please try again later.' 
            });
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setStatus({ 
        type: 'error', 
        message: 'Connection failed. Please check your internet and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Step 2: Verify security answer
  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!securityAnswer) {
      setStatus({ type: 'error', message: 'Please provide an answer to the security question' });
      return;
    }
    
    setIsSubmitting(true);
    setStatus(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/verify-security-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          username,
          answer: securityAnswer 
        }),
      });
      
      if (response.ok) {
        setCurrentStep('new-password');
        setStatus(null);
      } else {
        const errorData = await response.json();
        setStatus({ 
          type: 'error', 
          message: errorData.detail || 'Incorrect answer to security question' 
        });
      }
    } catch (error) {
      console.error('Error verifying security answer:', error);
      setStatus({ 
        type: 'error', 
        message: 'Connection failed. Please check your internet and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Step 3: Set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (!newPassword) {
      setStatus({ type: 'error', message: 'Please enter a new password' });
      return;
    }
    
    if (newPassword.length < 8) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters long' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    
    setIsSubmitting(true);
    setStatus(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          username,
          answer: securityAnswer,
          new_password: newPassword 
        }),
      });
      
      if (response.ok) {
        setCurrentStep('success');
        setStatus({ type: 'success', message: 'Your password has been reset successfully!' });
      } else {
        const errorData = await response.json();
        setStatus({ 
          type: 'error', 
          message: errorData.detail || 'Failed to reset password. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setStatus({ 
        type: 'error', 
        message: 'Connection failed. Please check your internet and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Password Recovery</h1>
        <p className="text-gray-600">
          {currentStep === 'request' && 'Enter your email to recover your account'}
          {currentStep === 'security-question' && 'Answer your security question'}
          {currentStep === 'new-password' && 'Create a new password'}
          {currentStep === 'success' && 'Your password has been reset'}
        </p>
      </div>
      
      {status && (
        <div className={`mb-4 p-3 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status.message}
        </div>
      )}
      
      {/* Step 1: Email Request Form */}
      {currentStep === 'request' && (
        <form onSubmit={handleRequestReset}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Continue'}
          </button>
          
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      )}
      
      {/* Step 2: Security Question Form */}
      {currentStep === 'security-question' && (
        <form onSubmit={handleVerifyAnswer}>
          <div className="mb-6">
            <p className="mb-2 text-gray-700 font-medium">Username: <span className="font-normal">{username}</span></p>
            <label htmlFor="securityQuestion" className="block text-sm font-medium text-gray-700 mb-1">
              Security Question
            </label>
            <p className="text-gray-800 mb-4 p-2 bg-gray-50 rounded border border-gray-200">
              {securityQuestion}
            </p>
            
            <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-700 mb-1">
              Your Answer
            </label>
            <input
              type="text"
              id="securityAnswer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Answer"
              required
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Verify Answer'}
          </button>
          
          <div className="mt-4 text-center">
            <button 
              type="button" 
              onClick={() => setCurrentStep('request')}
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Email Entry
            </button>
          </div>
        </form>
      )}
      
      {/* Step 3: New Password Form */}
      {currentStep === 'new-password' && (
        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              minLength={8}
              required
            />
            <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
          
          <div className="mt-4 text-center">
            <button 
              type="button" 
              onClick={() => setCurrentStep('security-question')}
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Security Question
            </button>
          </div>
        </form>
      )}
      
      {/* Step 4: Success */}
      {currentStep === 'success' && (
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          
          <Link
            href="/"
            className="w-full inline-block py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;