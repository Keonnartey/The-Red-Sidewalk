export const authFetch = async (url, options = {}) => {
  // Check if user is logged in
  const token = sessionStorage.getItem('token');
  const tokenType = sessionStorage.getItem('token_type');
  
  if (!token || !tokenType) {
    // If not logged in, redirect to login page
    window.location.href = '/';
    throw new Error('Not authenticated');
  }
  
  // Add authorization header if not already present
  const headers = options.headers || {};
  if (!headers['Authorization']) {
    headers['Authorization'] = `${tokenType} ${token}`;
  }
  
  // Return the fetch with auth headers
  return fetch(url, {
    ...options,
    headers,
  });
};
