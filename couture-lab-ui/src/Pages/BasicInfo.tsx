// Utility-related modules
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';  
import { doc, updateDoc, collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, FirebaseAuth } from '../Utilities/firebase';
import { PersonalizationFormObject } from '../Components/collapse';
import FormSelect from '../Components/formselect';

// UI-related modules
import { toast } from 'react-toastify';
import { Spinner } from '@chakra-ui/react';

// Styling
import styles from '../PageStyles/BasicInfo.module.css';


const options = {
    gender: ['Male', 'Female'],
    ageGroup: ['Under 18', '18 to 25', '26 to 35', '36 to 45', '46 to 55', 'Over 55'],
    preferredStyle: ['Casual', 'Formal', 'Business', 'Sporty', 'Bohemian', 'Vintage', 'Preppy', 'Other'],
    hairColor: ['Black', 'Brown', 'Blonde', 'Red', 'Grey', 'White', 'Other'],
    skinTone: ['Very Fair', 'Fair', 'Medium', 'Olive', 'Brown', 'Dark Brown', 'Other'],
    eyeColor: ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Other'],
    bodyType: ['Hourglass', 'Triangle', 'Inverted Triangle', 'Rectangle', 'Round', 'Other'],
    experimentLevel: ['Not Comfortable', 'Somewhat Comfortable', 'Very Comfortable'],
    budget: ['Low', 'Medium', 'High'],
    sustainabilityImportance: ['Not Important', 'Somewhat Important', 'Very Important'],
    frequentEvents: ['Work', 'Casual Outings', 'Formal Events', 'Fitness', 'Travel', 'Other'],
};

export default function BasicInfo() {
    // Loading for questions, for covering up async delay for checking if user has already answered questions
    const [loadingStatus, setLoadingStatus] = useState(true);
    // Checks if user is signed in
    const [userAlreadyAnswered, setUserAlreadyAnswered] = useState(false);
    // Current form state
    const [formStep, setFormStep] = useState(0);
    // Redirect to dashboards
    const navigate = useNavigate(); 

    // Manages form state and validation, tracks values and errors
    const { 
        watch, 
        register, 
        formState: { errors, isValid } 
    } = useForm({ mode: "all" });

    // Goes to next questions
    const nextStep = () => {    
        setFormStep(step => step + 1);
    }

    // Renders next or submit based on form step
    const renderFormButton = () => {
        if (formStep > 2) return;
        return (
            <button disabled={!isValid} onClick={formStep === 2 ? handleRedirectToDashboard : nextStep} type='button' 
                className={styles['basicinfo-next-button']}
            >
                {formStep === 2 ? 'Submit' : 'Next'}
            </button>
        );
    }

    const saveUserInfo = () => {
        const formData = watch(); // Get the current form data
        const questionnaireRef = doc(db, 'virtual-closet', 'questionnaires');
        
        let updateObj = {} as PersonalizationFormObject;
        updateObj[FirebaseAuth.currentUser!.uid] = formData;

        // Update Firebase display name
        updateProfile(FirebaseAuth.currentUser!, {
            displayName: formData.name
        });

        updateDoc(questionnaireRef, updateObj);
    }
 
    const handleRedirectToDashboard = () => {
        toast.success('Completed form!');
        saveUserInfo();
        setTimeout(() => {
            navigate('/closet');
        }, 1000);
    }

    const checkIfUserAlreadyAnswered = async () => {
        const closetRef = collection(db, "virtual-closet");

        const questionnaires = query(closetRef,
            where(documentId(), "==", "questionnaires"));

        const questionnaireSnapshot = await getDocs(questionnaires);
        questionnaireSnapshot.forEach(doc => {
            if (doc.data()[FirebaseAuth.currentUser!.uid]) {
                setUserAlreadyAnswered(true);
                setLoadingStatus(false); 
                return;
            }
        });
        setLoadingStatus(false);
    }

    useEffect(() => {
        checkIfUserAlreadyAnswered();
    }, []);

    return (
        <div className={styles['basicinfo-container']}>
            <div className={styles['basicinfo-form-container']}>
                <h1 className={styles['basicinfo-header']}>Sign Up</h1>
                { loadingStatus ? (
                    <Spinner size='lg' /> 
                ) : userAlreadyAnswered ? (
                    <div>
                        <h1 className={styles['basicinfo-alreadyanswered']}>Form was already been answered!</h1>
                        <a href='/closet' className={styles['basicinfo-backto']}>Back to Dashboard</a>
                    </div>
                ) : (
                    <div>
                        <form>
                        {formStep === 0 && (
                            <div className={styles['form-basicinfo']}>
                                <h1 className={styles['form-header']}>Basic Information</h1>
                                <label>What should we call you?</label>
                                <input placeholder='Name' required type='text' className={styles['form-input']} 
                                    {...register('name', { required: 'Name required' })} 
                                />
                                {errors.name && 
                                    <p className={styles['form-errormsg']}>
                                        {errors.name.message as string}
                                    </p>
                                }
                                <FormSelect 
                                    name="Gender" 
                                    defaultSelect=""
                                    options={options.gender} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Select gender" 
                                />
                                <label>Your age group helps us tailor suggestions more appropriately</label>
                                <FormSelect 
                                    name="Age group" 
                                    defaultSelect=""
                                    options={options.ageGroup} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Select age group" 
                                />
                                <h1 className={styles['form-header']}>Fashion Preferences</h1>
                                <label>Which style best describes your everyday fashion?</label>
                                <FormSelect 
                                    name="Preferred style" 
                                    defaultSelect=""
                                    options={options.preferredStyle} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Preferred Style" 
                                />
                            </div>
                        )}
                        {formStep === 1 && (
                            <div className={styles['form-basicinfo']}>
                                <h1 className={styles['form-header']}>Personal Characteristics</h1>
                                <h2>These questions help the AI suggest colors that complement your look.</h2>
                                <FormSelect 
                                    name="Hair color" 
                                    defaultSelect=""
                                    options={options.hairColor} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Hair Color" 
                                />
                                <label>What's your skin tone?</label>
                                <FormSelect 
                                    name="Skin tone" 
                                    defaultSelect=""
                                    options={options.skinTone} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Skin Tone" 
                                />
                                <label>What's your eye color?</label>
                                <FormSelect 
                                    name="Eye color" 
                                    defaultSelect=""
                                    options={options.eyeColor} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Eye Color" 
                                />
                                <h1 className={styles['form-header']}>Body type and Comfort</h1>
                                <label>Identifying your body type helps us suggest the most flattering outfits</label>
                                <FormSelect 
                                    name="Body type" 
                                    defaultSelect=""
                                    options={options.bodyType} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Body Type" 
                                />
                                <label>How open are you to trying new fashion styles?</label>
                                <FormSelect 
                                    name="Experiment level" 
                                    defaultSelect=""
                                    options={options.experimentLevel} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Experiment Level" 
                                />
                            </div>
                        )}
                        {formStep === 2 && (
                            <div className={styles['form-basicinfo']}>
                                <h1 className={styles['form-header']}>Shopping and Wardrobe Preferences</h1>
                                <label>Understanding your budget allows us to recommend clothes that fit your wallet</label>
                                <FormSelect 
                                    name="Budget" 
                                    defaultSelect=""
                                    options={options.budget} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Budget" />
                                <label>How important is sustainability in fashion to you?</label>
                                <FormSelect 
                                    name="Sustainability" 
                                    defaultSelect=""
                                    options={options.sustainabilityImportance} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Sustainability Importance" 
                                />
                                <h1 className={styles['form-header']}>Events and Occasions</h1>
                                <label>What types of events do you dress for most often?</label>
                                <FormSelect 
                                    name="Frequent events" 
                                    defaultSelect=""
                                    options={options.frequentEvents} 
                                    register={register} 
                                    errors={errors} 
                                    placeholder="Frequent Events" 
                                />
                            </div>
                        )}
                        {formStep === 3 && (
                            <div className={styles['form-basicinfo']}>
                                <h1>Shopping and Wardrobe Preferences</h1>
                                <h1>Thanks for finishing the questionnaire!</h1>
                            </div>
                        )}
                        </form>
                        <div className={styles['basicinfo-navbuttons']}>
                            {renderFormButton()}
                        </div>
                    </div>
                )}
            </div>
            <div className={styles['basicinfo-sidecontainer']}>
                <h1 className={styles['basicinfo-sidetext']}>
                    {'>'}Experience the greatest artificial intelligence 
                </h1>
                <h2 className={styles['basicinfo-sidetext-last']}>stylist.</h2>
                <h2 className={styles['basicinfo-side-bottomtext']}>Transform your fashion.</h2>
            </div>
        </div>
    );
}