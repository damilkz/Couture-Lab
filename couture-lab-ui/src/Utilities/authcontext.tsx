import { createContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { FirebaseAuth } from "./firebase";
import { User } from "firebase/auth";

export type Children = { children: React.ReactNode };

interface Context {
    currentUser: User | undefined,
    logoutUser: () => void
};

const defaultContext = { currentUser: undefined, logoutUser: () => {}};

export const AuthContext = createContext<Context>(defaultContext);

export const AuthProvider = ({ children }: Children) => {
    const [currentUser, setCurrentUser] = useState<User>();
    const [pending, setPending] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        FirebaseAuth.onAuthStateChanged((user) => {
            setCurrentUser(user as User);
            setPending(false);
        });
    }, []);

    let logoutUser = () => {
        FirebaseAuth.signOut();
        setCurrentUser(undefined);
        navigate('/signin');
    }

    let contextData = {
        currentUser: currentUser,
        logoutUser: logoutUser
    }

    if (pending) {
        return (
            <>
                Loading...
            </>
        );
    }

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};