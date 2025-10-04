import { useAuth } from '../contexts/AuthContext';

export const useAuthenticatedActions = () => {
  const { isAuthenticated } = useAuth();

  const handleAuthenticatedAction = (action) => {
    if (!isAuthenticated) {
      // Could use a toast or modal here to show a message
      alert('Please sign in to perform this action');
      return false;
    }
    return true;
  };

  const canEdit = isAuthenticated;

  return {
    handleAuthenticatedAction,
    canEdit,
    isAuthenticated
  };
};