import React from 'react';
import "./styleLoading.css";
// import { StyledLoading } from "./styleLoading";

export default function Loading() {
  return (
    <div className="loading">
      <div id="loader">
        <div id="box"></div>
        <div id="hill"></div>
        {/* <StyledLoading /> */}
      </div>
    </div>

  )
}
