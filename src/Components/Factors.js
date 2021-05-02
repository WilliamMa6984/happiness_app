import { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router";
import { AgGridReact } from "ag-grid-react";
import {API_URL} from "../App";
import "../Styles/Table.css";
import "../Styles/Graph.css";
import "../Styles/Factors.css";
import { CustomFilters } from './Rankings';
import { Bar } from 'react-chartjs-2';

// Access API
function getFactors(countryName, year) {
  const headers = {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }

  return fetch(`${API_URL}/factors/${year}?limit=10&country=${countryName}`, {headers})
    .then(res => res.json())
    .then(res => {
      if (year === '' || year === null) {
        throw new Error("Invalid year. Please select a year in the dropdown box on the left.");
      }
      else if (localStorage.getItem("token") === "") {
        throw new Error("You are not logged in");
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
            rank: factor.rank,
            country: factor.country,
            economy: factor.economy,
            family: factor.family,
            health: factor.health,
            freedom: factor.freedom,
            generosity: factor.generosity,
            trust: factor.trust
          };
        })
      );
}

// From API - rankings
function getUniqueYears(countryName) {
  return fetch(`${API_URL}/rankings?country=${countryName}`)
    .then(res => res.json())
    .then(res => {
      if (res.length === 0) {
        throw new Error("Invalid country");
      }
      else {
        return res; // Continue
      }
    })
    .then(rankings =>
      rankings.map(ranking => {
        return ranking.year;
      })
    );
}

function UseFactorsAPI(countryName, year) {
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState([]);
  const [selectFactors, setSelectFactors] = useState([]);
  const [error, setError] = useState(null);
  const [uniqueYears, setUniqueYears] = useState([]);
  
  useEffect(
    // Effects
    () => {
      
      // Get unique years first
      getUniqueYears(countryName)
        .then(years => setUniqueYears(years))
        .catch((e) => {throw e})
        .then(() => {
          // Get top 10 next
          getFactors('', year)
            .then(factors => setFactors(factors))
            .then(() => {
              // Get selected country
              if (countryName !== '') {
                getFactors(countryName, year)
                  .then(factors => setSelectFactors(factors))
                  .catch((e) => {throw e});
              }
            })
            .catch((e) => {setError(e)})
        })
        .catch((e) => {
          console.log(e);
          if (countryName === '' || countryName === null || e.message === "Invalid country") {
            setError(new Error("Invalid country. Please select a country from the home page."));
          }
          else {
            setError(e);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    // Dependencies
    [countryName, year]
  );

  // Return the values
  return {
      loading, factors, selectFactors, error, uniqueYears
  };
}

// MAIN
export default function Factors() {
  // URL Query
  const param = new URLSearchParams(useLocation().search);
  const country = param.get("country");
  const year = param.get("year");
  // Redirect
  const history = useHistory();

  // Hooks
  // Get rankings from API
  const { loading, factors, selectFactors, error, uniqueYears } = UseFactorsAPI(country, year);
  // Dropdown ref
  const yearDropdown = useRef("");


  // Set column headings
  const columnDefs = [
    {headername: "Rank", field: "rank", width: '65px'},
    {headername: "Country", field: "country", width: '180px'},
    {headername: "Economy", field: "economy"},
    {headername: "Family", field: "family"},
    {headername: "Health", field: "health"},
    {headername: "Freedom", field: "freedom"},
    {headername: "Generosity", field: "generosity"},
    {headername: "Trust", field: "trust"}
  ];

  
  // Graph factors data skeleton
  function factorData(type, bgColor, borderColor) {
    const capitalisedType = type.charAt(0).toUpperCase() + type.slice(1);

    return {
      labels: factors.map(factor => {
        return factor.country;
      }).concat(selectFactors.map(factor => {
        return factor.country;
      })), // Data from both factors and selected factor
      datasets: [{
        label: capitalisedType + ' Score compared to high ranked countries',
        data: factors.map(factor => {
          return parseFloat(factor[type]);
        }).concat(selectFactors.map(factor => {
          return parseFloat(factor[type]);
        })),
        backgroundColor: [
            bgColor, bgColor, bgColor, bgColor, bgColor, bgColor, bgColor, bgColor, bgColor, bgColor, 'rgba(94, 68, 143, 0.2)'
        ],
        borderColor: [
            borderColor, borderColor, borderColor, borderColor, borderColor, borderColor, borderColor, borderColor, borderColor, borderColor, 'rgba(94, 68, 143, 1)'
        ],
        borderWidth: 2
      }]
    }
  }
  // Graph factors data
  const economyData = factorData('economy', 'rgba(99, 255, 112, 0.2)', 'rgba(99, 255, 112, 1)');
  const familyData = factorData('family', 'rgba(152, 61, 255, 0.2)', 'rgba(152, 61, 255, 1)');
  const healthData = factorData('health', 'rgba(255, 43, 43, 0.2)', 'rgba(255, 43, 43, 1)');
  const freedomData = factorData('freedom', 'rgba(61, 81, 255, 0.2)', 'rgba(61, 81, 255, 1)');
  const generosityData = factorData('generosity', 'rgba(255, 98, 255, 0.2)', 'rgba(255, 98, 255, 1)');
  const trustData = factorData('trust', 'rgba(61, 242, 255, 0.2)', 'rgba(61, 242, 255, 1)');

  // Label axes for factors
  function factorsOptions(yLabel) {
    return {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Country'
          }
        },
        y: {
          title: {
            display: true,
            text: yLabel
          }
        }
      }
    }
  }

  // Year dropdown change detected
  function yearChange(props) {
    const input = props.target.value;
    // Prevent blank option
    if (input === "") return;

    history.push(`/Factors?country=${country}&year=${input}`);
    window.location.reload(false);
  }

  // Reset dropdown button
  function resetFilters() {
    yearDropdown.current.value = uniqueYears[0];
    history.push(`/Factors?country=${country}&year=${yearDropdown.current.value}`);
    window.location.reload(false);
  }

  // Change dropdown selection
  function setupParams() {
    yearDropdown.current.value = year;
    history.push(`/Factors?country=${country}&year=${yearDropdown.current.value}`);
  }

  return (
    <div className="content factorsContent">
      <h1>Factors</h1>
      {uniqueYears !== undefined ? (
        <div className="ag-theme-balham" style={{width: "850px"}}>
          <CustomFilters 
            yearChange={yearChange}
            yearDropdownRef={yearDropdown}
            years={uniqueYears}
            resetFilters={resetFilters}
          />
        </div>
      ) : null}
      <br/><br/>
      {// Check error
        error ?
          <div>
            <p>Something went wrong: {error.message}</p>
          </div>
        : (
          // Check loading
          loading ? <p>Please wait while we get the factors...</p> : (
            <div>
              {selectFactors[0] !== undefined ? <p>Check how {selectFactors[0].country} fairs against the top ranking countries!</p> : <p>The factors making up the happiness within the top ranking countries</p>}
              <br/>
              <div className="ag-theme-balham" style={{
                height: "345px",
                width: "1000px"
              }}>
                <AgGridReact className="Factor"
                  columnDefs={columnDefs}
                  defaultColDef={{
                    width: '125px'
                  }}
                  rowData={factors.concat(selectFactors)}
                  onGridReady={setupParams}
                />
                <br/>
                <div className="graphContainer">
                  <Bar
                    className="Graph"
                    data={economyData}
                    options={factorsOptions('Economy')}
                    height='250px'
                  />
                  <Bar
                    className="Graph"
                    data={familyData}
                    options={factorsOptions('Family')}
                    height='250px'
                  />
                </div>
                <br/>
                <div className="graphContainer">
                  <Bar
                    className="Graph"
                    data={healthData}
                    options={factorsOptions('Health')}
                    height='250px'
                  />
                  <Bar
                    className="Graph"
                    data={freedomData}
                    options={factorsOptions('Freedom')}
                    height='250px'
                  />
                </div>
                <br/>
                <div className="graphContainer">
                  <Bar
                    className="Graph"
                    data={generosityData}
                    options={factorsOptions('Generosity')}
                    height='250px'
                  />
                  <Bar
                    className="Graph"
                    data={trustData}
                    options={factorsOptions('Trust')}
                    height='250px'
                  />
                </div>
              </div>
            </div>
          )
        )
      }
    </div>
  )
}