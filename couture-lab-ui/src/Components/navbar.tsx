import styles from '../ComponentStyles/navbar.module.css';   

export default function NavBar() {
    return (
        <nav className={styles['navbar-container']}>
            <a href="/" className={styles["navbar-logo"]}>couturelab</a>
            <a href="/closet" className={styles["navbar-signin"]}>Sign in</a>
        </nav>
    );
}