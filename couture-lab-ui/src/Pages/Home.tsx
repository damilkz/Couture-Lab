import { useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { Container } from "tsparticles-engine";
import { loadSlim } from "@tsparticles/slim";

import { AuthContext } from '../Utilities/authcontext';

import NavBar from '../Components/navbar';
import Footer from '../Components/footer';

import DashboardImage from '../Assets/Images/closet.png';
import ClosetImage from '../Assets/Images/closet.png';
import ChatbotImage from '../Assets/Images/chatbot.png'



import styles from '../PageStyles/Home.module.css';

type StaggeredText = { text: string };

interface LoadOnViewProps {
  children: ReactNode
};

// Loads content on scroll
const LoadOnView = ({children}:  LoadOnViewProps) => (
    <motion.div initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
    >
        {children}
    </motion.div>
);

const StaggeredTextAnimation = (text: StaggeredText) => {
    return (
        <div className={styles['intro-header']}>
            {text.text.split("").map((char, index) => (
                <motion.span
                    key={index} //unique key prop for each child
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                    {char}
                </motion.span>
            ))}
        </div>
    );
};

export default function Home() {

    const navigate = useNavigate();

    const { currentUser } = useContext(AuthContext);
    
    // If user is signed in, redirects to closet
    useEffect(() => {
        if (currentUser) {
            navigate('/closet');
        }
    });

    const [init, setInit] = useState(false);

    // this should be run only once per application lifetime
    useEffect(() => {
      initParticlesEngine(async (engine) => {
        // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
        // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
        // starting from v2 you can add only the features you need reducing the bundle size
        //await loadAll(engine);
        //await loadFull(engine);
        await loadSlim(engine);
        //await loadBasic(engine);
      }).then(() => {
        setInit(true);
      });
    }, []);
  
    const particlesLoaded = async (container: Container | undefined) => {
      console.log(container);
    };
  
    const options = useMemo(
      () => ({
        fullScreen: {
            enable: false
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "repulse",
            },
          },
          modes: {
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: "#000000",
          },
          links: {
            color: "#000000",
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
          },
          move: {
            direction: "spin",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 6,
            straight: false,
          },
          number: {
            density: {
              enable: true,
            },
            value: 80,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "triangle"
          },
          size: {
            value: { min: 3, max: 5 },
          },
          rotate: {
            direction: "clockwise",
            animation: {
                enable: true,
                speed: 75,
                sync: false
            }
          }
        },
        detectRetina: true,
      }),
      [],
    );

    return (
        <div className={styles['content-container']}>
            <NavBar />
            {init ? <Particles
                    className={styles.tsparticles}
                    particlesLoaded={particlesLoaded as any}
                    options={options as any} /> : <></>}
            <LoadOnView>
                <section className={styles['intro-container']}>
                    <StaggeredTextAnimation text="Revolutionizing Fashion." />
                    <h1 className={styles['intro-description']}>Experience the Future of Styling</h1>
                    <a href='/closet' className={styles['getstarted-link']}>Get Started</a>
                </section>
            </LoadOnView>
            <LoadOnView>
                <section className={styles['whatweare-container']}>
                    <h1>
                        <span style={{ fontFamily: "MarkPro" }}>couturelab</span> seeks to create personalized recommendations through artificial intelligence, 
                        all to help <u>you</u> look and feel your best.
                    </h1>
                </section>
            </LoadOnView>
            <LoadOnView>
                <section className={styles['dashboardview-container']}>
                    <div>
                        <h1 className={styles['dashboardview-header']}>Dashboard</h1>  
                        <h2 className={styles['dashboardview-description']}>
                            Everything's located one click away, all in one place. Navigate effortlessly.
                        </h2>
                    </div>
                    <img className={styles['dashboardview-img']} src={DashboardImage} alt='dashboardimg' loading='lazy' />
                </section>
            </LoadOnView>
            <LoadOnView>
                <section className={styles['closetview-container']}>
                    <img className={styles['closetview-img']} src={ClosetImage} alt='closetimg' loading='lazy' />
                    <div>
                        <h1 className={styles['closetview-header']}>Virtual Closet</h1>  
                        <h2 className={styles['closetview-description']}>
                            Space for your smart fashion, catalog your wardrobe online.
                        </h2>
                    </div>
                </section>
            </LoadOnView>
            <LoadOnView>
                <section className={styles['chatbotview-container']}>
                    <div>
                        <h1 className={styles['chatbotview-header']}>AI Fashion Stylist</h1>  
                        <h2 className={styles['chatbotview-description']}>
                            Unlock and discover your distinct style, with tailored fashion suggestions powered by AI.
                        </h2>
                    </div>
                    <img className={styles['chatbotview-img']} src={ChatbotImage} alt='chatbotimg' loading='lazy' />
                </section>
            </LoadOnView>
            <LoadOnView>
                <div id='lastPageDesc' className={styles['lastview-container']}>
                    <h1 className={styles['lastview-header']}>What are you waiting for?</h1>
                    <a className={styles['lastview-link']} href='/closet'>Start Styling</a>
                </div>
            </LoadOnView>
            <Footer />
        </div>
    )
}