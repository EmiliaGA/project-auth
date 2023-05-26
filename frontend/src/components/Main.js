import React, { useEffect, useState } from "react";
import { useSelector, useDispatch, batch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/utils";
import { Navigate } from 'react-router-dom';

const Main = () => {
    const accessToken = useSelector((store) => store.user.accessToken)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [secretMessage, setSecretMessage] = useState(null);
      
        if (!accessToken) {
          return <Navigate to="/login" />;
        }

    useEffect(() => {
        if (!accessToken) {
            navigate("/login");
        } else {
            // GET
            const options = {
                headers: {
                    Authorization: accessToken
                }
            };

            fetch(`${API_URL}/secrets`, options)
                .then(res => res.json())
                .then(data => {
                    if (data.secret) {
                        setSecretMessage(data.secret);
                    } else {
                        setSecretMessage("Failed to fetch secret message");
                    }
                })
                .catch(error => {
                    console.log("Secrets fetch error", error);
                });
            }
        }, [accessToken, navigate]);

    const logOutButton = () => {
       // Clear user data from the Redux store and local storage
        batch(() => {
            dispatch(user.actions.setUserId(null));
            dispatch(user.actions.setAccessToken(null));
            dispatch(user.actions.setUserName(null));
            dispatch(user.actions.setError(null));
        });
        localStorage.removeItem("persist:root");
        navigate("/login")
    };

    return (
        <>
            <section>
                <div className="form-container">
                    <h1>Welcome page</h1>
                    <div>
                        {secretMessage && <p>{secretMessage}</p>}
                    </div>
                    <div className="button-container">
                        <button className="logout-button" type="button"
                            onClick={logOutButton}>Log out</button>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Main;