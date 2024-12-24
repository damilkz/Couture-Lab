import { createContext } from "react";
import { doc, updateDoc, collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { db, FirebaseAuth } from './firebase';

import { Children } from "./authcontext";

type PersonalizeResponses = { personalizeResponses: string }

interface Settings {
    fetchSettings: () => Promise<PersonalizeResponses>,
    setSettings: (personalize: string) => void
}

const defaultSettings = { fetchSettings: async () => { return { personalizeResponses: "1" } }, 
    setSettings: (personalize: string) => { console.log(personalize) } };

export const SettingsContext = createContext<Settings>(defaultSettings);

export const SettingsProvider = ({ children }: Children) => {
    
    const fetchSettings = async (): Promise<PersonalizeResponses> => {
        const settingsRef = collection(db, "virtual-closet");

        const settings = query(settingsRef,
            where(documentId(), "==", "settings"));

        const settingsSnapshot = await getDocs(settings);

        let userSettings = { personalizeResponses: "1" };
        settingsSnapshot.forEach(doc => {
            userSettings = doc.data()[FirebaseAuth.currentUser!.uid];
        });

        return userSettings;
    }

    const setSettings = (personalize: string) => {
        const settingsRef = doc(db, 'virtual-closet', 'settings');

        console.log(personalize);

        let updateObj = {} as Record<string, PersonalizeResponses>;
        updateObj[FirebaseAuth.currentUser!.uid] = {"personalizeResponses": personalize};

        updateDoc(settingsRef, updateObj);
    }

    let contextData = {
        fetchSettings: fetchSettings,
        setSettings: setSettings
    }

    return (
        <SettingsContext.Provider value={contextData}>
            {children}
        </SettingsContext.Provider>
    );
};