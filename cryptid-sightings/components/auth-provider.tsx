'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  is_active: boolean;
  role: string;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userAddress?: string;
  aboutMe?: string;
  birthday?: string;
  profilePic?: File | null;
}


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
  signUp: (userData: SignUpData) => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isGuest: false,
  login: async () => {},
  logout: () => {},
  continueAsGuest: () => {},
  signUp: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/signup', '/forgot-password', ''];

// Routes allowed for guests
const guestAllowedRoutes = ['/map'];

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state
  useEffect(() => {
    console.log("Auth initialization started");
    let isMounted = true; // For handling async operations during unmount
    
    const initAuth = async () => {
      try {
        // Check for guest mode first
        console.log("Session storage contents:", {
        token: sessionStorage.getItem('token'),
        tokenType: sessionStorage.getItem('token_type'),
        user: sessionStorage.getItem('user'),
        guestMode: sessionStorage.getItem('guestMode')
      });
        const guestMode = sessionStorage.getItem('guestMode');
        if (guestMode === 'true') {
          console.log("Guest mode active");
          if (isMounted) {
            setIsGuest(true);
            setIsAuthenticated(false);
            setIsLoading(false);
            return; // Exit early if in guest mode
          }
        }
        
        // If not in guest mode, check if user is already logged in (token exists)
        const token = sessionStorage.getItem('token');
        const tokenType = sessionStorage.getItem('token_type');
        
        console.log("Token found:", !!token);
        
        if (token && tokenType) {
          // Get user information
          const storedUser = sessionStorage.getItem('user');
          
          if (storedUser) {
            console.log("User found in session storage");
            if (isMounted) {
              setUser(JSON.parse(storedUser));
              setIsAuthenticated(true);
            }
          } else {
            // If token exists but no user data, try to fetch user data
            try {
              console.log("Fetching user data from API");
              const API_BASE_URL = 'http://localhost:8000';
              const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
                headers: {
                  'Authorization': `${tokenType} ${token}`
                }
              });
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                sessionStorage.setItem('user', JSON.stringify(userData));
                if (isMounted) {
                  setUser(userData);
                  setIsAuthenticated(true);
                }
              } else {
                // If token is invalid, clear sessionStorage
                console.log("Invalid token, clearing session");
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('token_type');
                sessionStorage.removeItem('user');
                if (isMounted) {
                  setIsAuthenticated(false);
                }
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              if (isMounted) {
                setIsAuthenticated(false);
              }
            }
          }
        } else {
          console.log("No token found");
          if (isMounted) {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          console.log("Setting isLoading to false");
          setIsLoading(false);
        }
      }
    };

    // Add a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Safety timeout triggered - forcing loading to complete");
        setIsLoading(false);
      }
    }, 5000); // 5 seconds timeout

    initAuth();
    
    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // Handle route protection - moved to a separate useEffect to avoid dependency issues
  useEffect(() => {
    // Only handle redirects when loading is complete
    if (!isLoading) {
      // IMPORTANT FIX: Calculate isPublicRoute inside the useEffect to ensure it's updated when pathname changes
      const isPublicRoute = publicRoutes.includes(pathname);
      const isGuestAllowedRoute = guestAllowedRoutes.includes(pathname);
      
      console.log("Route protection check:", {
        path: pathname,
        authenticated: isAuthenticated,
        guest: isGuest,
        publicRoute: isPublicRoute,
        guestAllowed: isGuestAllowedRoute
      });
      
      if (isGuest) {
        // Handle guest mode routing
        if (!isGuestAllowedRoute && !isPublicRoute) {
          console.log("Guest trying to access restricted page");
          // Show login modal instead of redirecting
          setShowLoginModal(true);
        } else {
          setShowLoginModal(false);
        }
      } else if (!isAuthenticated && !isPublicRoute) {
        console.log("Redirecting to login - protected route access attempt");
        // Redirect to login if not authenticated and trying to access protected route
        router.push('/');
      } else if (isAuthenticated && pathname === '/') {
        console.log("Redirecting to map - already authenticated");
        // Redirect to map page if already authenticated and on login page
        router.push('/map');
      }
    }
  }, [isAuthenticated, isGuest, isLoading, pathname, router]); // Remove isPublicRoute and isGuestAllowedRoute from dependencies

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const API_BASE_URL = 'http://localhost:8000';
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('username', email); // FastAPI OAuth2 uses 'username' field
      formData.append('password', password);
      
      console.log("Attempting login for:", email);
      
      const response = await fetch(`${API_BASE_URL}/api/users/token`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store the token for future authenticated requests
      sessionStorage.setItem('token', data.access_token);
      sessionStorage.setItem('token_type', data.token_type);
      
      // Clear guest mode if it was set
      sessionStorage.removeItem('guestMode');
      setIsGuest(false);
      
      // Get user information
      const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `${data.token_type} ${data.access_token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        // Add the redirect here - this is where you put the router.push
        router.push('/map');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (userData: SignUpData): Promise<void> => {
    setIsLoading(true);
    
    try {
      const API_BASE_URL = 'http://localhost:8000';
      
      // First, register the user account
      const registerResponse = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.email.split('@')[0] // Generate username from email
        }),
      });
      
      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
      
      const newUserData = await registerResponse.json();
      
      // If we have profile data to upload, do that next
      if (userData.userAddress || userData.aboutMe || userData.birthday || userData.profilePic) {
        // Create form data for profile info
        const profileFormData = new FormData();
        profileFormData.append('user_id', newUserData.id.toString());
        profileFormData.append('full_name', `${userData.firstName} ${userData.lastName}`);
        
        if (userData.userAddress) {
          profileFormData.append('user_address', userData.userAddress);
        }
        
        if (userData.aboutMe) {
          profileFormData.append('about_me', userData.aboutMe);
        }
        
        if (userData.birthday) {
          profileFormData.append('birthday', userData.birthday);
        }
        
        if (userData.profilePic) {
          profileFormData.append('profile_pic', userData.profilePic);
        }
        
        // Upload profile information
        await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'POST',
          body: profileFormData,
        });
      }
      
      // Automatically log in after successful registration
      await login(userData.email, userData.password);
      
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function

  // 1. Update the logout function in AuthProvider.tsx
  const logout = () => {
    // Clear auth tokens and user data
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('token_type');
    sessionStorage.removeItem('user');
    
    // IMPORTANT: Set guest mode instead of completely logging out
    sessionStorage.setItem('guestMode', 'true');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    setIsGuest(true); // Set to guest mode
    
    // Navigate to map page (guests can access it)
    router.push('/map');
  };
  const continueAsGuest = () => {
  // Clear any existing auth data first (just to be safe)
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('token_type');
  sessionStorage.removeItem('user');
  
  // Set guest mode flag
  sessionStorage.setItem('guestMode', 'true');
  
  // Update state
  setUser(null);
  setIsAuthenticated(false);
  setIsGuest(true);
  
  // Navigate to map page
  router.push('/map');
};
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isGuest,
        login,
        logout,
        continueAsGuest,
        signUp
      }}
    >
      {children}
      
      {/* Login Modal for Guest Users */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Login Required</h2>
            <p className="mb-4">Please login to view this page. Guest users can only access the map page.</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  router.push('/map');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Back to Map
              </button>
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  router.push('/');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}