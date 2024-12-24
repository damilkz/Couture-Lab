import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { FirebaseAuth } from '../Utilities/firebase';
import { AuthContext } from '../Utilities/authcontext';

import styles from '../PageStyles/SignIn.module.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const SignIn = () => {

    const navigate = useNavigate();

    const { currentUser } = useContext(AuthContext);

    // Checks if user is currentlysigned in or not
    const [userSignedIn, setUserSignedIn] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Checks if user is signed in
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FirebaseAuth, (user) => {
            if (user) {
                setUserSignedIn(true);
            } else {
                setUserSignedIn(false);
            }
        });

        // Cleanup function
        return () => unsubscribe();
    }, []);

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Log in user in Firebase
        try {
            const userCredential = await signInWithEmailAndPassword(FirebaseAuth, email, password);
            const user = userCredential.user;
            console.log(user);
            navigate("/closet");
        } catch (error) {
            console.log(error);
            toast.error('Failed to sign in.')
        }
    };

    if (currentUser) {
        navigate('/closet');
    }
    
    return (
        
        <div className={styles['signin-container']}>
            <div className={styles['signin-card']}>
                <div className={styles['card-header']}>
                    <a className={styles['couturelab-logo']} href='/'>couturelab</a>
                </div>
                <div className={styles['signin-content']}>
                    <div className={styles['signin-content-text']}>
                        <h1 className={styles['signin-header']}>Sign in</h1>
                        <h2 className={styles['signin-welcomeback']}>Welcome back</h2>
                    </div>
                    { userSignedIn ? (
                        <h1>You are already signed in</h1>
                    ) : (
                        <div className={styles['signin-input-container']}>
                            <form className={styles['signin-form']} onSubmit={handleSignIn}>
                                <h2 className={styles['form-title']}>Email</h2>
                                <input
                                    className={styles['form-input']}
                                    type="text"
                                    name="email"
                                    placeholder="E.u. hello"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <h2 className={styles['form-title']}>Password</h2>
                                <input
                                    className={styles['form-input']}
                                    type="password"
                                    name="password"
                                    placeholder="Enter Your Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <input className={styles['signin-submit']} type="submit" />
                            </form>
                            <div className={styles['signin-register']}>
                                <h2>Not Registered Yet?</h2>
                                <i>
                                    <a className={styles['signin-register-link']} href="/signup">
                                        Register
                                    </a>
                                </i>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignIn;