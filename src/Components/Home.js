import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { API_URL } from "../App";
import "../Styles/Home.css";

// Connect to the API
function UseCountriesAPI() {
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(
    // Effects
    () => {
      // Get the countries as a json string, and convert it to an array
      return fetch(`${API_URL}/countries`)
        .then(res => res.json())
        .then(countries => {
          setCountries(countries); // Already ordered alphabetically by API
        })
        .catch((e) => {
          setError(e);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    // Dependencies
    []
  );

  // Return the values
  return {
    loading, countries, error
  };
}

export default function Home() {
  // Hooks
  const { loading, countries, error } = UseCountriesAPI();
  
  // Redirect
  const history = useHistory();

  // Search form
  function handleSearch(event) {
    event.preventDefault();

    const input = event.target.countrySearch.value.toLowerCase(); // Search input, in lowercase
    const countriesLower = countries.map(country => country.toLowerCase()); // Get countries, in lowercase

    // Check it matches with countries list
    if (countriesLower.includes(input)) {
      history.push(`/Country?country=${input}`);
    }
    else {
      // Check if there's suggested country
      const reg = new RegExp(`.*${input}.*`);
      const firstOption = countriesLower.find(country => country.match(reg))

      if (firstOption) {
        event.target.countrySearch.value = firstOption; // Auto fill first suggestion
      }
      else {
        alert("Please type or select an appropriately named country"); // Not found
      }
    }
  }

  // Content
  return (
    <div className="homeContent">
      <div id="intro">
        <h1>World Happiness Report</h1>
        <br/><br/><br/>
        <p>The <b>World Happiness Report</b> is a <i>United Nations Sustainable Development Solutions Network</i> publication containing articles and rankings of national happiness throughout the world. Each annual report is available to the public, and we have organised them here!</p>
      </div>
      
      <div id="centre">
        <p>Search for a country below</p>
        
        {loading ? ( // Loading message
          <p>Please wait while we get the countries...</p>
        ) : ( // Display every country
          <form id="searchBar" onSubmit={handleSearch}>
            <input list="countrySearch" name="countrySearch" id="searchInput" />  
            <input type="reset" id="searchReset" value="X"/>
            <datalist id="countrySearch">
              
              {
              countries.map(country => (
                  <option key={country} value={country}/>
                ))
              }
            </datalist>
            <input type="submit" id="goBtn" value="Go"/>
            <p id="widthFix"></p>
          </form>
        )}
        {// Error message
          error ? <p>Something went wrong: {error.message}</p> : null
        }
      </div>
    </div>
  )
}