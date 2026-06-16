import React from "react";
import { useGolfAimInteraction } from "./useGolfAimInteraction";

const GREEN_IMAGE = `${process.env.PUBLIC_URL || ""}/assets/login/golf-green-island.webp`;

const GolfAimGame = () => {
  const {
    stageRef,
    ballRef,
    shadowRef,
    rippleRef,
    isAiming,
    isShooting,
    isLanded,
    power,
    trajectoryPoints,
    holePosition,
    ballStartPosition,
    handleBallPointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useGolfAimInteraction();

  return (
    <div className="pgti-golf-aim-scene">
      <div className="pgti-stage-orbit pgti-stage-orbit-one" />
      <div className="pgti-stage-orbit pgti-stage-orbit-two" />

      <div className="pgti-green-wrapper" ref={stageRef}>
        <img src={GREEN_IMAGE} className="pgti-green-image" alt="" draggable="false" />

        <svg className="pgti-trajectory-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {trajectoryPoints.map((point, index) => (
            <circle
              key={`${Math.round(point.x)}-${Math.round(point.y)}-${index}`}
              className="pgti-trajectory-dot"
              cx={point.x}
              cy={point.y}
              r={point.radius}
              opacity={point.opacity}
            />
          ))}
        </svg>

        <div
          className="pgti-hole-wrap"
          style={{ left: `${holePosition.x}%`, top: `${holePosition.y}%` }}
        >
          <div className="pgti-cup-ripple" ref={rippleRef} />
          <div className="pgti-hole" />
          <div className="pgti-flag">
            <span className="pgti-flag-pole" />
            <span className="pgti-flag-cloth" />
          </div>
        </div>

        {isAiming && (
          <div
            className="pgti-power-meter"
            style={{
              "--power": power,
              left: `${ballStartPosition.x - 9}%`,
              top: `${ballStartPosition.y + 7}%`,
            }}
          >
            <span />
          </div>
        )}

        <div className="pgti-ball-shadow" ref={shadowRef} />
        <button
          type="button"
          className={`pgti-ball ${isAiming ? "is-aiming" : ""} ${isShooting ? "is-shooting" : ""} ${isLanded ? "is-landed" : ""}`}
          ref={ballRef}
          onPointerDown={handleBallPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          aria-label="Golf ball. Click and hold to aim, release to shoot."
        >
          <span className="pgti-ball-surface" />
        </button>
      </div>

      <div className="pgti-instruction-pill">
        <span className="pgti-aim-icon" aria-hidden="true">+</span>
        Click and hold to aim
        <b>&bull;</b>
        Release to shoot
      </div>
    </div>
  );
};

export default GolfAimGame;
