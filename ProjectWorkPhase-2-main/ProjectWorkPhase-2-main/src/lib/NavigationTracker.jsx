import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    // Log user activity when navigating to a page (for local client, this is optional)
    useEffect(() => {
        if (isAuthenticated) {
            // For local client, we can log to console or localStorage if needed
            console.log('Navigation:', location.pathname);
        }
    }, [location, isAuthenticated]);

    return null;
}