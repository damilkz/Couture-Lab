// Utility-related modules
import { uploadBytes, ref } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useRef } from 'react';
import { storage, db, FirebaseAuth } from '../Utilities/firebase';
import { ClosetItem, UpdateItemObject } from './deleteModal';
import FormData from 'form-data';

// UI-related modules
import {
    AlertDialog, AlertDialogBody, AlertDialogHeader, AlertDialogContent, 
	AlertDialogOverlay, AlertDialogCloseButton, Select, Input,
    Progress
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { AiOutlineCloudUpload } from "react-icons/ai";
import styles from '../PageStyles/Modal.module.css';
import { MutableRefObject } from 'react';

interface Props {
    isOpen: boolean,
    onClose: () => void,
    clothesPicture: File,
    setClothesPicture: React.Dispatch<React.SetStateAction<File | null>>,
    uploadingStatus: boolean,
    setUploadingStatus: React.Dispatch<React.SetStateAction<boolean>>,
    uploadName: MutableRefObject<string>,
    uploadCategory: MutableRefObject<HTMLSelectElement>,
    setGalleryData: React.Dispatch<React.SetStateAction<Array<ClosetItem>>>,
    selectedCategory: string,
    setFilteredGallery: React.Dispatch<React.SetStateAction<Array<ClosetItem>>>
}

const UploadModal = ({
    isOpen, 
    onClose, 
    clothesPicture, 
    setClothesPicture, 
    uploadingStatus, 
    setUploadingStatus, 
    uploadName, 
    uploadCategory, 
    setGalleryData, 
    selectedCategory, 
    setFilteredGallery 
}: Props) => {

    const cancelRef = useRef(null);

    const handleClose = () => {
        setClothesPicture(null);
        setUploadingStatus(false);
        onClose();
    }
    
    const handleAdd = async () => {
        if (uploadName.current.trim() === '' || uploadCategory.current.value === '') {
            toast.error("Please add a name for the item and pick a category!");
            return;
        }
    
        const removebgKey = process.env.REMOVE_BG_KEY;
        const removebgUrl = 'https://api.remove.bg/v1.0/removebg';
    
        const formData = new FormData();
    
        try {
            formData.append('image_file', clothesPicture, uploadName.current);
            formData.append('size', 'auto');
        }
        catch (e) {
            toast("Please upload a file!");
            return;
        }
    
        let processedPicture = null;
    
        // Generate unique name for the image to prevent
        // duplicates overwriting each other
        const storageName = uuidv4();
    
        const storageRef = ref(storage, storageName);
    
        setUploadingStatus(true);
    
        
        try {
            if (!removebgKey) {
                throw new Error('API key is missing');
            }
            
            const res = await fetch(removebgUrl, {
                method: 'POST',
                headers: {
                    'X-api-key': removebgKey
                },
                body: formData as any   // couldn't find proper way to convert to acceptable type
            });
    
            processedPicture = await res.blob();
        }
        catch (e) {
            toast.error("Error removing background from the item image");
            handleClose();
            return;
        }
    
        try {
            await uploadBytes(storageRef, processedPicture);
        }
        catch (e) {
            toast.error(`Error - ${e}`);
            handleClose();
            return;
        }
    
        toast.success("Item added successfully!");
        handleClose();
    
        const itemsRef = doc(db, 'virtual-closet', 'items');
    
        const newItem = {
            category: uploadCategory.current.value,
            storageName: storageName,
            displayName: uploadName.current,
            url: `https://firebasestorage.googleapis.com/v0/b/couture-lab-backend.appspot.com/o/${storageName}?alt=media`
        }
    
        let updateObj = {} as UpdateItemObject;
        updateObj[FirebaseAuth.currentUser!.uid] = arrayUnion(newItem);
    
        await updateDoc(itemsRef, updateObj);
    
        setGalleryData(prevState => {
            return [...prevState, newItem];
        });
    
        if ((newItem.category === selectedCategory) || (selectedCategory === "all")) {
            setFilteredGallery(prevState => {
                return [...prevState, newItem];
            });
        }
    }


    return (
        <AlertDialog
            motionPreset='slideInBottom'
            onClose={handleClose}
            leastDestructiveRef={cancelRef}
            closeOnEsc={false}
            closeOnOverlayClick={!uploadingStatus}
            isOpen={isOpen}
            isCentered
        >
            <AlertDialogOverlay ref={cancelRef} /> 
            <AlertDialogContent className={styles['closet-dialog-content']}>
                <AlertDialogHeader>
                    New Item
                </AlertDialogHeader>
                <AlertDialogCloseButton className={`${uploadingStatus && styles['closet-upload-disabled']}`}/>
                <AlertDialogBody>
                    <label>
                        <input type='file' hidden accept=".jpg,.png"
                            onChange={(e) => setClothesPicture(e.target.files![0])}
                        />
                        { uploadingStatus ? <Progress isIndeterminate colorScheme="teal" /> :
                        clothesPicture ?
                        <div className={styles['preview-image-container']}>
                            <img
                                className={styles['preview-image']}
                                src={URL.createObjectURL(clothesPicture)}
                                alt='clothesPic' loading='lazy' />
                            <div className={styles['preview-image-overlay']}>
                                Change Image
                            </div>
                        </div> :
                        <div className={styles['closet-upload-input']}>
                            <AiOutlineCloudUpload size={40} />
                            <p className={styles['closet-input-header']}>
                                Upload Your Picture of the Item
                            </p>
                            <p className={styles['closet-input-caption']}>
                                Accepts .jpg or .png
                            </p>
                        </div> }
                    </label>
                    <div className={styles['closet-dialog-user-interaction']}>
                        <label className={styles['closet-dialog-label']}>Display Name</label>
                        <Input
                            className={styles['closet-input-name']}
                            placeholder="Set the item name"
                            onChange={e => uploadName.current = e.target.value} 
                        />
                        <label className={styles['closet-dialog-label']}>Select Category</label>
                        <Select
                            placeholder='Choose a category for your item'
                            focusBorderColor='black'
                            ref={uploadCategory} 
                        >
                                <option value='top'>Top</option>
                                <option value='bottom'>Bottom</option>
                                <option value='shoe'>Shoe</option>
                                <option value='accessory'>Accessory</option>
                        </Select>
                    </div>
                    <button
                        className={`${styles['closet-upload-button']} ${uploadingStatus && styles['closet-upload-disabled']}`}
                        onClick={handleAdd}>
                            Add
                    </button>
                </AlertDialogBody>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default UploadModal;