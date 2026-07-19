import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getMyProfile, getMyDesignerProfile, getMyClientProfile, getMyStats, ProfileResponse, DesignerProfilePayload, ClientProfilePayload, DesignerStats } from '../services/api';

interface UserContextValue {
  profile: ProfileResponse | null;
  designerProfile: DesignerProfilePayload | null;
  clientProfile: ClientProfilePayload | null;
  stats: DesignerStats | null;
  isLoading: boolean;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  refetch: () => void;
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  designerProfile: null,
  clientProfile: null,
  stats: null,
  isLoading: true,
  email: '',
  role: '',
  firstName: '',
  lastName: '',
  refetch: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [designerProfile, setDesignerProfile] = useState<DesignerProfilePayload | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfilePayload | null>(null);
  const [stats, setStats] = useState<DesignerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(localStorage.getItem('email') ?? '');
  const [role, setRole] = useState(localStorage.getItem('role') ?? '');

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const currentRole = localStorage.getItem('role') ?? '';
    setEmail(localStorage.getItem('email') ?? '');
    setRole(currentRole);

    setIsLoading(true);
    try {
      const isDesigner = currentRole === 'DESIGNER';
      const isClient = currentRole === 'CLIENT';
      const [base, designer, statsResult, client] = await Promise.allSettled([
        getMyProfile(),
        isDesigner ? getMyDesignerProfile() : Promise.resolve(null),
        isDesigner ? getMyStats() : Promise.resolve(null),
        isClient ? getMyClientProfile() : Promise.resolve(null),
      ]);

      if (base.status === 'fulfilled') {
        setProfile(base.value);
      }
      if (designer.status === 'fulfilled' && designer.value) setDesignerProfile(designer.value);
      if (statsResult.status === 'fulfilled' && statsResult.value) setStats(statsResult.value);
      if (client.status === 'fulfilled' && client.value) setClientProfile(client.value);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <UserContext.Provider value={{
      profile,
      designerProfile,
      clientProfile,
      stats,
      isLoading,
      email,
      role,
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      refetch: fetchProfile,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useCurrentUser = () => useContext(UserContext);
