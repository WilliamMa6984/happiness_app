import { useState } from "react";
import { useHistory } from "react-router-dom";
import {API_URL} from "../App";
import "../Styles/Login.css";

export default function Register() {
  const emailErrorMsg = "Invalid email (must be in the format example@email.abc)";
  const pwdErrorMsg = "Invalid password (must be at least 6 characters long, and contain at least one number)";

  // Hooks
  const [emailError, setEmailError]  = useState(emailErrorMsg);
  const [pwdError, setPwdError]  = useState(pwdErrorMsg);
  const [regError, setRegError]  = useState(null);

  // Redirect
  const history = useHistory();

  function emailChange(event) {
    const { value } = event.target; // use destructuring to get the value
    if (/.+@.+[.].+/.test(value)) {
      setEmailError(null);
    } else {
      setEmailError(emailErrorMsg);
    }
  }

  function passwordChange(event) {
    const { value } = event.target; // use destructuring to get the value
    if (value.length >= 6 && /[0-9]/.test(value)) {
      setPwdError(null);
    } else {
      setPwdError(pwdErrorMsg);
    }
  }

  function register(event) {
    event.preventDefault();
    if (emailError === null || pwdError === null) {
      return fetch(`${API_URL}/user/register`, {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          email: event.target.elements.email.value,
          password: event.target.elements.password.value })
      })
        .then(res => res.json())
        .then(res => {
          setRegError(res.message);
          if (res.error !== true) history.push("/Login?re=true");
        });

      
    }
}

  return (
    <div className="LoginForm content">
      <h1>Register</h1>
      <p>Enter your email and password to register</p>
      <br/>
      <form onSubmit={register}>
        <div className="inputDiv">
          <label for="email">Email</label>
          <input type="email" id="email" name="email"
            placeholder="Email"
            onChange={emailChange}/>
        </div>
        <br/>
        <div className="inputDiv">
          <label for="password">Password</label>
          <input type="password" id="password" name="password"
            placeholder="Password"
            onChange={passwordChange}/>
        </div>
        <br/>
        <input type="submit" className="submitBtn" value="Register"/>
      </form>
      <br/>

      {emailError != null ? <p>{emailError}</p> : null}
      {pwdError != null ? <p>{pwdError}</p> : null}
      {regError != null ? <p>{regError}</p> : null}
    </div>
  )
}