import { useState, useEffect, useRef } from "react";
import { API_URL } from "../App";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { useLocation, useHistory } from "react-router-dom";
import "../Styles/Table.css";

// Get the rankings as a json string, and convert it to a map
function getRankings() {
  return fetch(`${API_URL}/rankings`)
    .then(res => res.json())
    .then(res => {
      if (res.length === 0) {
        throw new Error("Rankings not found");
      }
      else {
          return res; // Continue
      }
    })
    .then(rankings =>
      rankings.map(ranking => {
        return {
          rank: ranking.rank,
          country: ranking.country,
          score: ranking.score,
          year: ranking.year
        };
      })
    );
}

// Connect to the API
function UseRankingsAPI() {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(
    // Effects
    () => {
      getRankings()
        .then(rankings => setRankings(rankings))
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
    loading, rankings, error
  };
}

// Get unique years
function getUniqueYears(rankingsIn, yearsOut) {
  // Get unique years
  rankingsIn.map(ranking => {
    const year = ranking["year"];
    // Check if not already contains year
    if (!yearsOut.includes(year)) {
      yearsOut.push(year);
    }
    return null;
  })

  // Sort years
  yearsOut.sort((a, b) => b - a);
}

// React components
export function CustomFilters(props) {
  return (
    <div className="customFilters">
      <div>
        <span style={{fontSize: 15}}>Select Year:</span>
        <select onChange={props.yearChange} ref={props.yearDropdownRef}>
          <option></option>
          {
            props.years.map(year => (
              <option key={year}>{year}</option>
            ))
          }
        </select>
      </div>
      <input type="button" onClick={props.resetFilters} className="resetFilter" value="Reset Filters"/>
    </div>
  )
}

// Main
export default function Rankings() {
  // Hooks
  // Get rankings from API
  const { loading, rankings, error } = UseRankingsAPI();
  const [grid, setGrid] = useState({});
  const [uniqueYears] = useState([]);
  const yearDropdown = useRef("");

  // Redirect
  const history = useHistory();
  // URL Query
  const params = new URLSearchParams(useLocation().search);

  // Set column headings
  const columnDefs = [
    {headername: "Rank", field: "rank", sortable: true},
    {headername: "Country", field: "country", sortable: true, filter: true, floatingFilter: true},
    {headername: "Score", field: "score", sortable: true},
    {headername: "Year", field: "year", sortable: true, filter: false},
  ];
  
  // If not gotten unique years map yet -> get it
  if (uniqueYears.length === 0 && rankings.length !== 0) getUniqueYears(rankings, uniqueYears);

  // Event handlers
  // Get URL params and set filters to them
  function gridReady(props) {
    // Grid API for get/set filter params
    setGrid(props.api);

    // Create filter from URL param
    let filter = {}
    if (params.has("country")) {
      filter.country = {
        type: "contains",
        filterType: "text",
        filter: params.get("country")
      }
    }
    if (params.has("year")) {
      filter.year = {
        type: "equals",
        filterType: "number",
        filter: params.get("year")
      }
      
      // Change dropdown selection
      yearDropdown.current.value = params.get("year");
    }

    // Set filter
    props.api.setFilterModel(filter);
  }

  // Update URL parameters when filter changes
  function filterChange() {
    const filterModel = grid.getFilterModel();

    let pushText = "?";
    // Found country param
    const country = filterModel.country;
    if (typeof(country) !== 'undefined') {
      pushText += `country=${country.filter}`;
    }
    // Found year param
    const year = filterModel.year;
    if (typeof(year) !== 'undefined') {
      if (pushText !== "?") pushText += "&"; // If not first param
      pushText += `year=${year.filter}`;
    }

    // Found nothing
    if (pushText === "?") history.push("/Rankings"); // Remove filter
    else history.push(pushText); // Replace URL with filter param
  }

  // Handle reset filter
  function resetFilters() {
    grid.setFilterModel(null);
    // Reset dropdown
    yearDropdown.current.value = "";
  }

  // Handle year dropdown change
  function yearChange(props) {
    let filter = grid.getFilterModel();
    filter.year = {
      type: "equals",
      filterType: "number",
      filter: props.target.value
    }

    grid.setFilterModel(filter);
  }

  // Start of rendering
  if (error) {
    return <p>Something went wrong: {error.message}</p>;
  }

  return (
    <div className="content">
      <h1>Rankings</h1>
      <p>Countries ranked by their reported national happiness.</p>
      <p>Click on a column to sort. Filter by country and/or year.</p>
      <br/>
      {loading ? (
        <p>Please wait while we get the rankings...</p>
      ) : (
        // Display rankings in a React table
        <div className="ag-theme-balham" style={{
            height: "659px",
            width: "802px"
        }}>
          <CustomFilters
            yearChange={yearChange}
            yearDropdownRef={yearDropdown}
            years={uniqueYears}
            resetFilters={resetFilters}
          />
          <br/>
          <br/>
          <br/>
          <AgGridReact className="Rank"
            columnDefs={columnDefs}
            rowData={rankings}
            pagination={true}
            paginationPageSize={20}
            onFilterChanged={filterChange}
            onGridReady={gridReady}
          />
        </div>
      )}
      {// Error message
        error ? <p>Something went wrong: {error.message}</p> : null
      }
    </div>
  )
}