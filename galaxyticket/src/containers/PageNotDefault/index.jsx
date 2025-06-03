import React from 'react';
import { Link } from "react-router-dom";

export default function PageNotFound() {
  let handleClickBackHome = () => {

  }
  return (
    <div id="notfound">
      <div class="notfound">
        <div class="notfound-404">
          <h1>404</h1>
          <h2>Page not found</h2>
        </div>
        <Link to="/">
          <a href="#" onClick={handleClickBackHome}>Homepage</a>
        </Link>
      </div>
    </div>
  )
}
