import { useContext, useEffect, useState } from "react";
import UserContext from "../../context/use.context";
import { KEY_CONTEXT_USER } from "../../context/use.reducer";

const ErrorPage = () => {
    const [userCtx, dispatch] = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(true);

    const loadingPage = () => {
        dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: true });
        setTimeout(() => {
            dispatch({ type: KEY_CONTEXT_USER.SET_LOADING, payload: false });
            setIsLoading(false)
        }, 3000);
    }

    useEffect(() => {
        loadingPage();
    }, []);

    return (
        <>
            {isLoading ? (
                ""
            ) : (
                <div style={styles.container}>
                    <h1 style={styles.heading}>Error 404</h1>
                    <p style={styles.message}>Page not found</p>
                </div>
            )}
        </>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
    },
    heading: {
        fontSize: '3rem',
        color: '#ff0000',
    },
    message: {
        fontSize: '1.5rem',
        marginTop: '1rem',
    },
};

export default ErrorPage;
