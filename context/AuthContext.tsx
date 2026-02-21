import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { storage } from '../services/storage';
import { User } from '../types';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    isRecovering: boolean;
    setIsRecovering: (value: boolean) => void;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRecovering, setIsRecovering] = useState(false);

    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const loadUser = async () => {
        try {
            let user = await storage.getCurrentUser();

            if (!user && isLocalHost) {
                user = { id: 'dev-id', name: 'Dev Local', email: 'dev@sincro.com', role: 'admin' };
            }

            setCurrentUser(user);
        } catch (error) {
            console.error('Auth Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecovering(true);
            }
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                loadUser();
            }
            if (event === 'SIGNED_OUT') {
                if (!isLocalHost) {
                    setCurrentUser(null);
                    setIsRecovering(false);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await storage.signOut();
        if (!isLocalHost) {
            setCurrentUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            loading,
            isRecovering,
            setIsRecovering,
            signOut,
            refreshUser: loadUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
