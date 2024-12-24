import NavBar from '../Components/navbar';

import styles from '../PageStyles/NotFound.module.css';

export default function NotFound() {
    return (
        <div>
            <NavBar />
            <div className={styles['notfound-text-container']}>
                <h1 className={styles['notfound-header']}>404 Error</h1>
                <h2 className={styles['notfound-description']}>The page you were looking for doesn’t exist</h2>
                <a href='/' className={styles['notfound-redirect']}>Go to home page</a>
            </div>
        </div>
    )
}