import React, { useState, useEffect } from 'react';
import styled  from "styled-components";
import { useDispatch, useSelector, batch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/utils';
import user from 'reducers/user';

const OuterWrapper = styled.div `
  display: flex;
  height: 100vh;
  width: 100%;
  justify-content: center;
  text-align: center;
  
`
const InnerWrapper = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    border: 1px solid #94b1aa;
    box-shadow: 4px 4px 8px #94b1aa;
    padding: 10px;
    margin: 120px;

`
const FormWrapper = styled.div `

     form {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 30vw;
        height: auto;
        padding: 20px;
    }
    input {  
        display: flex;
        margin: 5px;
        padding: 10px;
        border-radius: 5px;
        width: 200px;
        cursor: pointer;
    }
    button {
        background-color: #568b7f;
        border: none;
        border-radius: 20px;
        color: #fff;
        padding: 10px 30px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        margin: 10px 2px;
        cursor: pointer;
    }

`
const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState("login");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const accessToken = useSelector(store => store.user.accessToken);
    useEffect(() => {
        if(accessToken) {
            navigate("/")
        }
    }, [accessToken]);

    const onFormSubmit = (event) => {
        event.preventDefault();
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name: username, password: password})
        }
        fetch(API_URL(mode), options)
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    console.log(data)
                    dispatch(user.actions.setAccessToken(data.response.accessToken));
                    dispatch(user.actions.setUsername(data.response.name));
                    dispatch(user.actions.setUserId(data.response.id));
                    dispatch(user.actions.setError(null));
                } else {
                    dispatch(user.actions.setAccessToken(null));
                    dispatch(user.actions.setUsername(null));
                    dispatch(user.actions.setUserId(null));
                    dispatch(user.actions.setError(data.response))
                }
            })
    }

    return (
        <OuterWrapper>
            <InnerWrapper>
                <FormWrapper>  
                    <form onSubmit={onFormSubmit}>
                        <label htmlFor="username">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} />
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} />
                        <button type="submit">Submit</button>
                    </form>
                </FormWrapper>
                 
                <Wrapper>
                    <label htmlFor="register">Register</label>
                    <input 
                        type="radio" 
                        id="register" 
                        checked={mode === "register"}
                        onChange={() => setMode("register")}/>

                    <label htmlFor="login">Login</label>
                    <input 
                        type="radio" 
                        id="login" 
                        checked={mode === "login"}
                        onChange={() => setMode("login")}/>
                </Wrapper>
            </InnerWrapper>
        </OuterWrapper>
        
    )
}
export default Login;