import React from "react";
import GolfAimGame from "./GolfAimGame";
import "./pgti-golf-login.css";

const PgtiGolfLoginPage = ({ children }) => {
  return (
    <div className="pgti-golf-login-page">
      <section className="pgti-login-card-layer" data-login-card="true">
        {children}
      </section>

      <section className="pgti-golf-stage">
        <GolfAimGame />
      </section>
    </div>
  );
};

export default PgtiGolfLoginPage;
