import styles from '../ComponentStyles/footer.module.css';

export default function Footer() {
    return (
        <footer className={styles['footer-container']}>
            <div className={styles['footer-title']}>couturelab</div>
            <div className={styles['footer-content']}>
                <p className={styles['footer-date']}>
                    &copy; {new Date().getFullYear()} <span className={styles['couturelab-logo']}>couturelab</span>
                </p>
                <ul className={styles['footer-links']}>
                    <li><a href="/contact">Contact Us</a></li>
                </ul>
            </div>
        </footer>
    );
}