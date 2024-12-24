// Utility-related modules
import { useContext, useRef } from 'react';
import { deleteUser } from 'firebase/auth';
import { doc, deleteField, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db, FirebaseAuth } from '../Utilities/firebase';
import { AuthContext } from '../Utilities/authcontext';

// UI-related modules
import {
    AlertDialog, AlertDialogBody, AlertDialogHeader, AlertDialogContent, 
	AlertDialogOverlay, AlertDialogFooter, Button
} from '@chakra-ui/react';
import { toast } from 'react-toastify';


interface Props {
    isOpen: boolean,
    onClose: () => void
}

const DeleteAccountModal = ({isOpen, onClose}: Props) => {
    // Redirect management
    const navigate = useNavigate();
    // Logout user function
    let { logoutUser } = useContext(AuthContext);

    const cancelRef = useRef(null);

    const deleteAccount = async () => {
        const closetRef = doc(db, 'virtual-closet', 'items');
        const questionnaireRef = doc(db, 'virtual-closet', 'questionnaires');
        const settingsRef = doc(db, 'virtual-closet', 'settings');
        
        // Deletes user items in Firestore Database
        await updateDoc(closetRef, {
            [FirebaseAuth.currentUser!.uid]: deleteField()
        });
        // Deletes user styling preferences in Firestore Database
        await updateDoc(questionnaireRef, {
           [FirebaseAuth.currentUser!.uid]: deleteField()
        });
        // Deletes user settings in Firestore Database
        await updateDoc(settingsRef, {
            [FirebaseAuth.currentUser!.uid]: deleteField()
         });
        // Closes dialog
        onClose();

        // Deletes user account
        deleteUser(FirebaseAuth.currentUser!).then(() => {
            toast.success('Deleted account');
        }).catch((error) => {
            // Firebase needs to reauthenticate if user has not signed in a while
            toast.error('Failed to delete account. You may need to sign in again.');
            console.log(error);
        });
        
        logoutUser();
        navigate('/signin');
    }

    return (
        <AlertDialog
            motionPreset='slideInBottom'
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isOpen={isOpen}
            isCentered
        >
            <AlertDialogOverlay />
            <AlertDialogContent>
                <AlertDialogHeader>
                    Delete Account?
                </AlertDialogHeader>
                <AlertDialogBody>
                    Are you sure? You can't undo this.
                </AlertDialogBody>  
                <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme='red' onClick={deleteAccount} ml={3}>
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteAccountModal;