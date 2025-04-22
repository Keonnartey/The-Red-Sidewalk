'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/auth-provider';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginStatus {
  type: string;
  message: string;
}

interface AuthData {
  access_token: string;
  token_type: string;
}

interface LoginPageProps {
  onLoginSuccess?: (data: AuthData) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const router = useRouter();
  const { continueAsGuest } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginStatus, setLoginStatus] = useState<LoginStatus | null>(null);

  const API_BASE_URL = 'http://localhost:8000';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setLoginStatus(null);
      
      try {
        // Create form data for the API request (FastAPI expects form data)
        const formDataObj = new FormData();
        formDataObj.append('username', formData.email); // FastAPI OAuth2 uses 'username' field
        formDataObj.append('password', formData.password);
        
        // Call the actual API endpoint
        console.log("Attempting login for:", formData.email);
        
        const response = await fetch(`${API_BASE_URL}/api/users/token`, {
          method: 'POST',
          body: formDataObj
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Login failed');
        }
        
        const data = await response.json();
        
        // Store the token for future authenticated requests - using sessionStorage
        sessionStorage.setItem('token', data.access_token);
        sessionStorage.setItem('token_type', data.token_type);
        
        // Get user information
        const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            'Authorization': `${data.token_type} ${data.access_token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Store user data if needed
          sessionStorage.setItem('user', JSON.stringify(userData));
        }
        
        setLoginStatus({ type: 'success', message: 'Login successful! Redirecting...' });
        
        // Call the success callback after a slight delay to show the success message
        setTimeout(() => {
          // Use window.location for a hard redirect that ensures the page refreshes
          window.location.href = '/map';
        }, 1500);
        
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('Incorrect email or password')) {
          errorMessage = 'Incorrect email or password. Please try again.';
        } else if (error.message.includes('Could not validate credentials')) {
          errorMessage = 'Authentication failed. Please try again.';
        } else if (error.message.includes('connection')) {
          errorMessage = 'Connection to server failed. Please check your internet connection.';
        }
        
        setLoginStatus({ 
          type: 'error', 
          message: errorMessage 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to Real Things Sightings</h1>
        <p className="text-gray-600">Sign in to continue to your account</p>
      </div>
      
      {loginStatus && (
        <div className={`mb-4 p-3 rounded ${loginStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {loginStatus.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">or</p>
        <button
          onClick={handleGuestAccess}
          className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Continue as Guest
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;