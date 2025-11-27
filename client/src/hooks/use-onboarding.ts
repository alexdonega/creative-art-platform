import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useUserCompanies } from './use-user-companies';

export function useOnboarding() {
  const { user } = useAuth();
  const { companies, isLoading: companiesLoading } = useUserCompanies(user?.id || '');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setShowOnboarding(false);
      setIsChecking(false);
      return;
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
    
    if (hasCompletedOnboarding) {
      setShowOnboarding(false);
      setIsChecking(false);
      return;
    }

    // Wait for companies to load
    if (companiesLoading) {
      return;
    }

    // If user has no companies, show onboarding
    if (!companies || companies.length === 0) {
      setShowOnboarding(true);
    }
    
    setIsChecking(false);
  }, [user, companies, companiesLoading]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    if (user) {
      localStorage.removeItem(`onboarding_completed_${user.id}`);
    }
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    isChecking,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}