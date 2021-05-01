import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { AgGridReact } from "ag-grid-react";
import { Link } from 'react-router-dom';
import {API_URL} from "../App";
import "../Styles/Country.css";
import "../Styles/Table.css";
import "../Styles/Graph.css";
import { Line } from 'react-chartjs-2';

// Get the rankings as a json string, and convert it to a map
function getRankings(countryName) {
  return fetch(`${API_URL}/rankings?country=${countryName}`)
    .then(res => res.json())
    .then(res => {
        if (countryName === "") {
          throw new Error("Cannot get all countries");
        }
        else if (res.error) {
            throw new Error(res.message);
        }
        else if (res.length === 0) {
            throw new Error("Country not found"); // Custom error - no country
        }
        else {
            return res; // Continue
        }
    })
    .then(rankings =>
        rankings.map(ranking => {
          return {
            country: ranking.country,
            rank: ranking.rank,
            score: ranking.score,
            year: ranking.year
          };
        })
      );
}

// Connect to the API - rankings and factors
function UseRankingsFactorsAPI(countryName) {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [error, setError] = useState(null);

  const [loadingFactors, setLoadingFactors] = useState(true);
  const [factors, setFactors] = useState([]);
  const [errorFactors, setErrorFactors] = useState(null);
  

  useEffect(
    // Effects
    () => {
      getRankings(countryName)
        .then(rankings => {
          setRankings(rankings)
          return rankings;
        })
        .then(rankings => {
          // Get the years of the data
          return rankings.map(rank => rank.year);
        })
        .then(years => {
          let factorsTemp = [];

          years.forEach(year => {
            getFactors(countryName, year)
            .then(factorsIn => factorsTemp.push(factorsIn[0]))
            .catch((e) => {
              setErrorFactors(e);
            })
            .finally(() => {
              setLoadingFactors(false);
            })
          });

          setFactors(factorsTemp);
        })
        .catch((e) => {
          setError(e);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    // Dependencies
    [countryName]
  );

  // Return the values
  return {
      loading, rankings, error, loadingFactors, factors, errorFactors
  };
}

function getFactors(countryName, year) {
  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }

  return fetch(`${API_URL}/factors/${year}?country=${countryName}`, {headers})
    .then(res => res.json())
    .then(res => {
      if (localStorage.getItem("token") === "") {
        throw new Error("You are not logged in")
      }
      else if (res.error) {
        throw new Error(res.message);
      }
      else {
        return res; // Continue
      }
    })
    .then(factors =>
      factors.map(factor => {
          return {
            economy: factor.economy,
            family: factor.family,
            health: factor.health,
            freedom: factor.freedom,
            generosity: factor.generosity,
            trust: factor.trust,
            year: year
          };
        })
      );
}

export default function Factors() {
    // Hooks
    // URL Query
    const param = new URLSearchParams(useLocation().search).get("country");

    // Get rankings from API
    const { loading, rankings, error, loadingFactors, factors, errorFactors } = UseRankingsFactorsAPI(param);
    const [ loadFactors, setLoadFactors ] = useState([]);
    
    // Set column headings
    const columnDefs = [
      {headername: "Rank", field: "rank", sortable: true},
      {headername: "Score", field: "score", sortable: true},
      {headername: "Year", field: "year", sortable: true}
    ];
    const columnDefsFactors = [
      {headername: "Year", field: "year", sortable: true},
      {headername: "Economy", field: "economy", sortable: true},
      {headername: "family", field: "family", sortable: true},
      {headername: "health", field: "health", sortable: true},
      {headername: "freedom", field: "freedom", sortable: true},
      {headername: "generosity", field: "generosity", sortable: true},
      {headername: "trust", field: "trust", sortable: true}
    ]

    // Default heading 1
    let heading1 = param ? `Searching for ${param}...` : `Invalid country`;
    // Got a country -> set heading 1 string
    if (rankings.length !== 0) {
      heading1 = rankings[0].country;
    }

    // Graph ranking data
    const rankingData = {
      labels: rankings.map(ranking => {
        return parseInt(ranking.year);
      }).sort((a, b) => a - b),
      datasets: [{
        label: 'Overall Happiness Score over the Years',
        data: rankings.map(ranking => {
          return parseFloat(ranking.score);
        }).reverse(),
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2
      }]
    }

    // Graph factors data
    function factorData(type, bgColor, borderColor) {
      const capitalisedType = type.charAt(0).toUpperCase() + type.slice(1);

      return {
        labels: factors.map(factor => {
          return parseInt(factor.year);
        }).sort((a, b) => a - b),
        datasets: [{
          label: capitalisedType + ' Score over the Years',
          data: factors.map(factor => {
            return parseFloat(factor[type]);
          }).reverse(),
          backgroundColor: [
              bgColor
          ],
          borderColor: [
              borderColor
          ],
          borderWidth: 2
        }]
      }
    }

    const economyData = factorData('economy', 'rgba(99, 255, 112, 0.2)', 'rgba(99, 255, 112, 1)');
    const familyData = factorData('family', 'rgba(152, 61, 255, 0.2)', 'rgba(152, 61, 255, 1)');
    
    const healthData = factorData('health', 'rgba(255, 43, 43, 0.2)', 'rgba(255, 43, 43, 1)');
    const freedomData = factorData('freedom', 'rgba(61, 81, 255, 0.2)', 'rgba(61, 81, 255, 1)');
    const generosityData = factorData('generosity', 'rgba(255, 98, 255, 0.2)', 'rgba(255, 98, 255, 1)');
    const trustData = factorData('trust', 'rgba(61, 242, 255, 0.2)', 'rgba(61, 242, 255, 1)');
    
    // Load factors button event
    function handleLoad() { setLoadFactors(factors); }

    return (
      <div className="content countryContent">
      <h1>{heading1}</h1>
      {// Check error
          error ?
            <div>
              <p>Something went wrong: {error.message}</p>
              <Link to="/" ><input type="button" value="Go back to search" /></Link>
            </div>
          : (
              // Check loading
              loading ? <p>Please wait while we get the rankings...</p> : (
                  <div>
                    <h2><Link to={`/Rankings?country=${param}`}>Go to Rankings</Link></h2>
                    <div className="ag-theme-balham" style={{
                        height: "235px",
                        width: "610px"
                    }}>
                        <AgGridReact className="Rank"
                        columnDefs={columnDefs}
                        rowData={rankings}
                        pagination={true}
                        paginationPageSize={6}
                        />
                    </div>
                    <br/>
                    <Line
                      className="Graph"
                      data={rankingData}
                    />
                    <br/>
                  </div>
              )
          )
      }
      {// Check error
        errorFactors ?
          <div>
            <p>Something went wrong: {errorFactors.message}</p>
          </div>
        : (
          // Check loading
          loadingFactors ? <p>Please wait while we get the factors...</p> : (
            <div>
              <h2><Link to={`/Factors?country=${param}`}>Go to Factors</Link><input type="button" onClick={handleLoad} value="Load" /></h2>
              <div className="ag-theme-balham" style={{
                height: "252px",
                width: "610px"
                }}>
                <AgGridReact className="Factor"
                columnDefs={columnDefsFactors}
                rowData={loadFactors}
                pagination={true}
                paginationPageSize={6}
                
                />
                <br/>
                <Line
                  className="Graph"
                  data={economyData}
                />
                <br/>
                <br/>
                <Line
                  className="Graph"
                  data={familyData}
                />
                <br/>
                <br/>
                <Line
                  className="Graph"
                  data={healthData}
                />
                <br/>
                <br/>
                <Line
                  className="Graph"
                  data={freedomData}
                />
                <br/>
                <br/>
                <Line
                  className="Graph"
                  data={generosityData}
                />
                <br/>
                <br/>
                <Line
                  className="Graph"
                  data={trustData}
                />
                <br/>
              </div>
            </div>
          )
        )
      }
      </div>
    )
}