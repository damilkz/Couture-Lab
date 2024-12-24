import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  

import { FirebaseAuth } from '../Utilities/firebase';

import NavBar from '../Components/navbar';

import styles from '../PageStyles/VerifyEmail.module.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmail() {
    const navigate = useNavigate(); 
    const user = FirebaseAuth.currentUser;

    // Resends verification email
    const resendVerifyEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            sendEmailVerification(user!);
            console.log("Clicked verify email");
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Tab is in view, reload the user
                reloadUserAndRedirect();
            }
        };

        // Reloads user and redirects to dashboard
        const reloadUserAndRedirect = async () => {
            if (user) {
                await user.reload(); // Reload the user
                if (user.emailVerified) {
                    navigate('/basicinfo');
                    toast.success('Successfully registered an account')
                }
            }
        }

        // Visibility change event listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [navigate, user]);

    return (
        <div className={styles['verifyemail-container']}>
            <NavBar />
            <section className={styles['verifyemail-text-container']}>
                <h1 className={styles['verifyemail-header']}>Please verify your email</h1>
                <h2 className={styles['verifyemail-text']}>You're almost there! We sent an email to you.</h2>
                <h2 className={styles['verifyemail-text']}>Click on the link in the email to complete your signup. 
                <br />You may need to <b>check your spam</b> folder.</h2>
                <h2 className={styles['verifyemail-text']}>Still can't find it?</h2>
                <button className={styles['verifyemail-resendemail']} type="button" onClick={resendVerifyEmail}>
                    Resend Verification Email
                </button>
            </section>
        </div>
    );
}
