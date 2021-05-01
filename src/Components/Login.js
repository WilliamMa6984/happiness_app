import {API_URL} from "../App";
import { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import "../Styles/Login.css";

export default function Login() {
  // Hooks
  const [loginError, setLoginError]  = useState(false);
  const [refresh, setRefresh]  = useState(false);

  // Redirect
  const history = useHistory();
  // URL Query
  const params = new URLSearchParams(useLocation().search);

  function login(event) {
    event.preventDefault();
  
    return fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        email: event.target.elements.email.value,
        password: event.target.elements.password.value })
      })
      .then((res) => res.json())
      .then((res) => {
        // Successful login -> refresh page
        if (res.error !== true) {
          setRefresh(true);
          window.location.reload(false);
          localStorage.setItem("token", res.token);
        }
        else setLoginError(res.message);
      });
  }

  if (refresh) {
    setRefresh(false);
    history.push("/");
  }

  return (
    <div className="LoginForm content" style={{backgroundColor:"aliceblue"}}>
      <h1>Login</h1>
      <p>Login with your email address and password</p>
      <br/>
      <form onSubmit={login}>
        <div className="inputDiv">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="Email"/>
        </div>
        <br/>
        <div className="inputDiv">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Password"/>
        </div>
        <br/>
        <input type="submit" className="submitBtn" value="Login"/>
      </form>
      
      {params.get("re") === "true" ? <p>Account registered. Please enter your login details.</p> : null}
      {loginError != null ? <p>{loginError}</p> : null}
    </div>
  )
}