import { NavLink } from 'react-router-dom';
import { useLocation } from "react-router";
import { linkParams } from "../App";

// Sign out button function
function signOut() {
  localStorage.setItem("token", "");
  window.location.reload(false);
}
export default function NavBar() {
  // URL Query
  const params = new URLSearchParams(useLocation().search);

  return (
    <div className="NavBar">
        <ul>
          <li><NavLink to={`/${linkParams(params)}`}><img src="/logo192.png" width="30px" alt="Home Logo by Timothy Miller"/></NavLink></li>
          <li><NavLink to={`/Country${linkParams(params)}`} activeClassName="navLinkSelected" className="navTab">Country</NavLink></li>
          <li><NavLink to={`/Rankings${linkParams(params)}`} activeClassName="navLinkSelected" className="navTab">Rankings</NavLink></li>
          <li><NavLink to={`/Factors${linkParams(params)}`} activeClassName="navLinkSelected" className="navTab">Factors</NavLink></li>
          <li id="navSeparator" />
          { // Check if not logged in
          localStorage.getItem("token") === "" ?
            <li><NavLink to="/Register" activeClassName="navLinkSelected" className="navTab">Register</NavLink></li>
            : 
            <li><button onClick={signOut} id="signOutButton">Sign Out</button></li>
          }
          { // Check if not logged in
          localStorage.getItem("token") === "" ?
            <li><NavLink to="/Login" activeClassName="navLinkSelected" className="navTab">Login</NavLink></li> : null}
        </ul>
    </div>
  )
}