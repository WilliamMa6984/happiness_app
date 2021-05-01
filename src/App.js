import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';

import NavBar from './Components/NavBar';
import Home from './Components/Home';
import Country from './Components/Country';
import Rankings from './Components/Rankings';
import Factors from './Components/Factors';
import Register from './Components/Register';
import Login from './Components/Login';

export const API_URL = "http://131.181.190.87:3000";

export function linkParams(params) {
  return params.get("country") === null ? "" : "?country=" + params.get("country");
}

function App() {

  // Add URL params to NavLinks

  return (
    <Router>
      <div className="bg"></div>
      <div className="App">
        <NavBar/>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/Country">
            <Country />
          </Route>
          <Route path="/Rankings">
            <Rankings />
          </Route>
          <Route path="/Factors">
            <Factors />
          </Route>
          <Route path="/Register">
            <Register />
          </Route>
          <Route path="/Login">
            <Login />
          </Route>
        </Switch>

        <div id="attribution">
          <a href="https://www.iconfinder.com/icons/126572/home_house_icon">Home icon by Timothy Miller from IconFinder</a>
          <br/><br/>
          <a href="https://www.vecteezy.com/vector-art/1311545-glowing-world-map-background-design">Background by wngstd from Vecteezy</a>
        </div>
      </div>
    </Router>
  );
}

export default App;
