// OAuth utility functions for Google and Facebook authentication

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'facebook';
}

// Mock implementations for development
export const mockGoogleAuth = (): Promise<OAuthUser> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        picture: 'https://via.placeholder.com/100',
        provider: 'google'
      });
    }, 1500);
  });
};

export const mockFacebookAuth = (): Promise<OAuthUser> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'facebook_' + Date.now(),
        email: 'user@facebook.com',
        name: 'Facebook User',
        picture: 'https://via.placeholder.com/100',
        provider: 'facebook'
      });
    }, 1500);
  });
};