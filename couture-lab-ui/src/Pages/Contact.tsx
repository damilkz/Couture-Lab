// Utility-related modules 
import { useState } from 'react';

// UI-related modules
import { toast } from 'react-toastify';
import Navbar from '../Components/navbar';
import Footer from '../Components/footer';

import styles from '../PageStyles/Contact.module.css';


export default function Contact() {
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const { name, email, message } = formData;

    const isFormValid = name && email && message;

    const submitContactMessage = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        // send email to dxiong372@gmail.com using firebase using name, email, and message in the form
        toast.success('Message submitted.');
        setSubmitted(true);
    }

    return (
        <div className={styles["contact-container"]}>
            <Navbar />
            <div className={styles["contact-intro-container"]}>
                <h1 className={styles["contact-header"]}>let's talk</h1>    
                <section className={styles["contact-info-container"]}>
                    <h2>1240 Arroyo Vista, Albuquerque, New Mexico, US</h2>
                    <br />
                    <h2 className={styles["contact-info"]}>000.000.0000</h2>
                    <h2 className={styles["contact-info"]}>
                        <a href="mailto:hello@gmail.com">hello@couturelab.com</a>
                    </h2>
                </section>
            </div>
            <div className={styles['contact-form-container']}>
                <h1 className={styles['contact-form-header']}>Contact</h1>
                {!submitted ? (
                    <form className={styles['form-container']}>
                        <label className={styles['form-input-label']}>Full Name</label>
                        <input className={styles['form-input']} placeholder='Your Name' type='text' name='name' value={name} onChange={handleChange}></input>
                        <label className={styles['form-input-label']}>Email</label>
                        <input className={styles['form-input']} placeholder='Your Email' type='email' name='email' value={email} onChange={handleChange}></input>
                        <label className={styles['form-input-label']}>Message</label>
                        <textarea className={styles['form-input']} placeholder='Your Message Here' name='message' value={message} onChange={handleChange}></textarea>
                        <button 
                            onClick={submitContactMessage} 
                            className={`${styles['contact-form-submit']} ${!isFormValid && styles['contact-form-disabled']}`} 
                            disabled={!isFormValid}
                        >
                            Submit
                        </button>
                    </form>
                ) : (
                    <h1>Message Submitted Successfully!</h1>
                )}
            </div>
            <Footer />
        </div>
    )
}