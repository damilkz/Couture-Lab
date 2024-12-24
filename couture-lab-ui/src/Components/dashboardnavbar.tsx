// Utility-related modules
import { useContext, useRef } from 'react';
import { AuthContext } from '../Utilities/authcontext';

// UI-related modules
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
} from '@chakra-ui/react'
import styles from '../ComponentStyles/dashboardnavbar.module.css';


export default function DashboardNavBar() {
    const dropdownRef = useRef(null);
    
    let { logoutUser } = useContext(AuthContext);

    return (
        <nav id="dashboard-navbar" className={styles['dashboard-navbar']}>
            <a className={styles['couturelab-logo']} href='/'>couturelab</a>
            <div className={styles['dashboard-navbar-dropdown']} ref={dropdownRef}>
                <Popover placement='bottom-end'>
                    <PopoverTrigger>
                    <button>
                        <svg className={styles['dashboard-navbar-usericon']} 
                            viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                        >
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                            <g id="SVGRepo_iconCarrier"> 
                                <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> 
                            </g>
                        </svg>
                    </button>
                    </PopoverTrigger>
                    <PopoverContent fontSize={18} maxWidth={175}>
                        <PopoverArrow />
                        <PopoverHeader>Settings</PopoverHeader>
                        <PopoverBody>
                            <a className={styles['dashboard-navbar-a']} href="/profile">Profile</a>
                        </PopoverBody>
                        <PopoverBody>
                            <button className={styles['dashboard-navbar-a']} onClick={logoutUser}>Sign Out</button>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </div>
        </nav>
    );
}
