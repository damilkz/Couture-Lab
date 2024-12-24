import { Navigate } from 'react-router-dom';
import { useContext } from 'react';

import { AuthContext } from './authcontext';
import { Children } from './authcontext';

export default function PrivateRoute({children}: Children) {
    let { currentUser } = useContext(AuthContext);

    return (
        !currentUser ? <Navigate to='/signin'/> : children
    );
}