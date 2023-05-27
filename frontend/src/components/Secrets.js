import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import user from '../reducers/user';
import { batch } from 'react-redux';
import { API_URL } from '../utils/utils';

const OuterWrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  justify-content: center;
  text-align: center;
  background-image: url('../images/secret.jpg'); 
  background-size: cover;
  background-position: center;
`;

const Secrets = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((store) => store.user.accessToken);
  const [secretMessage, setSecretMessage] = useState(null);

  useEffect(() => {
    const options = {
      headers: {
        Authorization: accessToken,
      },
    };

    fetch(`${API_URL}/secrets`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data.secret) {
          setSecretMessage(data.secret);
        } else {
          setSecretMessage('Failed to fetch secret message');
        }
      })
      .catch((error) => {
        console.log('Secrets fetch error', error);
        setSecretMessage('Failed to fetch secret message');
      });
  }, [accessToken]);

  const logOutButton = () => {
    // Clear user data from the Redux store
    batch(() => {
      dispatch(user.actions.setAccessToken(null));
      dispatch(user.actions.setUsername(null));
      dispatch(user.actions.setError(null));
    });

    // Clear the persisted user data from localStorage
    localStorage.removeItem('persist:root');

    // Reload the page or perform any necessary actions after logging out
    // For example: window.location.reload();
  };

  return (
    <OuterWrapper>
      <div>
        <h1>This is a Secret Page</h1>
        {/* <p>{secretMessage}</p> */}
        <p>This is the secret page! Woop woop</p>
        <button onClick={logOutButton}>Log Out</button>
      </div>
    </OuterWrapper>
  );
};

export default Secrets;