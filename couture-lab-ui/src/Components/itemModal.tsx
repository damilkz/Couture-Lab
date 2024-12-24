// Utility-related modules
import { deleteObject, ref } from 'firebase/storage';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { storage, db, FirebaseAuth } from '../Utilities/firebase';
import { useRef } from 'react';
import { ClosetItem, UpdateItemObject } from './deleteModal';
import debounce from "debounce";

// UI-related modules
import {
    AlertDialog, AlertDialogBody, AlertDialogHeader, AlertDialogContent, 
	AlertDialogOverlay, AlertDialogCloseButton, Progress
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import styles from '../PageStyles/Modal.module.css';


interface Props {
    isOpen: boolean,
    onClose: () => void,
    deletingStatus: boolean,
    setDeletingStatus: React.Dispatch<React.SetStateAction<boolean>>,
    selectedItem: ClosetItem,
    selectedCategory: string,
    setGalleryData: React.Dispatch<React.SetStateAction<Array<ClosetItem>>>,
    setFilteredGallery: React.Dispatch<React.SetStateAction<Array<ClosetItem>>>,
    openStylist: () => void,
    handleQuery: (event: React.FormEvent<HTMLFormElement> | string) => void
}

export default function ItemModal({ 
    onClose, isOpen, deletingStatus, setDeletingStatus, selectedItem,
    selectedCategory, setGalleryData, setFilteredGallery, openStylist,
    handleQuery
}: Props) {
    const cancelRef = useRef(null);

    // Prevent double clicks from querying the assistant twice
    const handleImageQuery = debounce(handleQuery, 200);

    const handleClose = () => {
        setDeletingStatus(false);
        onClose();
    }

    const handleGenerate = async () => {
        onClose();
        openStylist();
        handleImageQuery(selectedItem.url);
    }

    const handleDelete = async () => {
        const storageRef = ref(storage, selectedItem.storageName);

        setDeletingStatus(true);

        try {
            await deleteObject(storageRef);
        }
        catch (e) {
            toast("An Error Occurred!" + e);
            handleClose();
            return;
        }

        toast.success("Item deleted successfully!");
        handleClose();

        const itemsRef = doc(db, 'virtual-closet', 'items');

        const deletedItem = 
        {
            category: selectedItem.category,
            storageName: selectedItem.storageName,
            displayName: selectedItem.displayName,
            url: selectedItem.url
        };

        let updateObj = {} as UpdateItemObject;
        updateObj[FirebaseAuth.currentUser!.uid] = arrayRemove(deletedItem);

        await updateDoc(itemsRef, updateObj);

        setGalleryData(prevState => {
            return prevState.filter(item => item.storageName !== deletedItem.storageName);
        });

        if ((deletedItem.category === selectedCategory) || (selectedCategory === "all")) {
            setFilteredGallery(prevState => {
                return prevState.filter(item => item.storageName !== deletedItem.storageName);
            });
        }
    }

    return (
        <AlertDialog
            motionPreset='slideInBottom'
            onClose={onClose}
            leastDestructiveRef={cancelRef}
            closeOnEsc={false}
            closeOnOverlayClick={!deletingStatus}
            isOpen={isOpen}
            isCentered
        >
            <AlertDialogOverlay ref={cancelRef} />
            <AlertDialogContent className={styles['closet-dialog-content']}>
                <AlertDialogHeader>
                    {selectedItem.displayName}
                </AlertDialogHeader>
                <AlertDialogCloseButton className={`${deletingStatus && styles['closet-upload-disabled']}`}/>
                <AlertDialogBody display="flex" flexDirection="column" alignItems="center">
                    { deletingStatus ? <Progress isIndeterminate colorScheme="teal" /> :
                    <img
                        className={styles['preview-image']}
                        src={selectedItem.url}
                        alt='selectedItem' loading='lazy' />
                    }
                    <div className={styles['closet-delete-categories']}>
                        <p className={styles['closet-delete-category']}>
                            Category: {selectedItem?.category?.charAt(0).toUpperCase() + selectedItem?.category?.slice(1)}
                        </p>
                    </div>
                    <div className={styles['item-modal-buttons']}>
                        { selectedItem.category !== "outfit" &&
                        <button
                            className={`${styles['closet-delete-button']} ${deletingStatus && styles['closet-upload-disabled']}`}
                            onClick={handleGenerate}
                            >
                                Generate Outfit
                        </button>
                        }
                        <button
                            className={`${styles['closet-delete-button']} ${deletingStatus && styles['closet-upload-disabled']}`}
                            onClick={handleDelete}>
                                Delete Item
                        </button>
                    </div>
                </AlertDialogBody>
            </AlertDialogContent>
        </AlertDialog>
    );
}