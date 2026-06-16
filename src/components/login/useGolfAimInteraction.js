import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

export const getBezierPoint = (start, control, end, t) => {
  const oneMinusT = 1 - t;
  return {
    x: oneMinusT * oneMinusT * start.x + 2 * oneMinusT * t * control.x + t * t * end.x,
    y: oneMinusT * oneMinusT * start.y + 2 * oneMinusT * t * control.y + t * t * end.y,
  };
};

export const getTrajectoryPoints = (start, control, end, count) =>
  Array.from({ length: count }, (_, index) => {
    const t = (index + 1) / (count + 1);
    return getBezierPoint(start, control, end, t);
  });

export const getPowerFromDrag = (dragDistance, maxDrag) => clamp(dragDistance / maxDrag, 0, 1);

export const getAimVector = (startPointer, currentPointer) => ({
  x: startPointer.x - currentPointer.x,
  y: startPointer.y - currentPointer.y,
});

const MAX_DRAG = 120;
const MIN_SHOOT_DRAG = 18;
const RESET_DELAY = 1450;
const BALL_START_POSITION = { x: 84, y: 76 };
const HOLE_POSITION = { x: 78, y: 26 };

const getPointFromPercent = (rect, point) => ({
  x: rect.width * (point.x / 100),
  y: rect.height * (point.y / 100),
});

const pxToPercentPoint = (point, rect) => ({
  x: (point.x / rect.width) * 100,
  y: (point.y / rect.height) * 100,
});

const getTrajectoryPercentPoints = (start, control, end, count, rect) =>
  getTrajectoryPoints(start, control, end, count).map((point, index) => ({
    ...pxToPercentPoint(point, rect),
    radius: clamp(1.25 - index * 0.025, 0.72, 1.25),
    opacity: clamp(0.94 - index * 0.035, 0.42, 0.94),
  }));

const getShotControlPoint = (start, end, power) => {
  const arcHeight = clamp(78 + power * 105 + distance(start, end) * 0.05, 80, 180);
  return {
    x: lerp(start.x, end.x, 0.48),
    y: Math.min(start.y, end.y) - arcHeight,
  };
};

const setElementTransform = (element, x, y, scale = 1, rotate = 0) => {
  if (!element) return;
  element.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`;
};

export const useGolfAimInteraction = () => {
  const stageRef = useRef(null);
  const ballRef = useRef(null);
  const shadowRef = useRef(null);
  const rippleRef = useRef(null);
  const animationFrameRef = useRef(null);
  const resetTimerRef = useRef(null);
  const dragRef = useRef(null);
  const ballPositionRef = useRef({ x: 0, y: 0 });
  const startPointRef = useRef({ x: 0, y: 0 });
  const holePointRef = useRef({ x: 0, y: 0 });
  const reducedMotionRef = useRef(false);

  const [isAiming, setIsAiming] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [isLanded, setIsLanded] = useState(false);
  const [power, setPower] = useState(0);
  const [trajectoryPoints, setTrajectoryPoints] = useState([]);

  const syncLayoutPoints = useCallback((resetBall = false) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startPoint = getPointFromPercent(rect, BALL_START_POSITION);
    const holePoint = getPointFromPercent(rect, HOLE_POSITION);
    startPointRef.current = startPoint;
    holePointRef.current = holePoint;

    if (resetBall) {
      ballPositionRef.current = startPoint;
      setElementTransform(ballRef.current, startPoint.x, startPoint.y);
      setElementTransform(shadowRef.current, startPoint.x + 8, startPoint.y + 28, 1);
      if (shadowRef.current) {
        shadowRef.current.style.opacity = "0.28";
      }
    }
  }, []);

  const clearAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const resetBall = useCallback((smooth = true) => {
    clearAnimation();
    syncLayoutPoints(false);
    setIsAiming(false);
    setIsShooting(false);
    setPower(0);
    setTrajectoryPoints([]);

    const start = ballPositionRef.current;
    const end = startPointRef.current;

    if (!smooth || reducedMotionRef.current) {
      ballPositionRef.current = end;
      setElementTransform(ballRef.current, end.x, end.y);
      setElementTransform(shadowRef.current, end.x + 8, end.y + 28, 1);
      setIsLanded(false);
      return;
    }

    const startedAt = performance.now();
    const duration = 360;

    const frame = (now) => {
      const t = clamp((now - startedAt) / duration, 0, 1);
      const eased = easeInOutCubic(t);
      const x = lerp(start.x, end.x, eased);
      const y = lerp(start.y, end.y, eased);

      ballPositionRef.current = { x, y };
      setElementTransform(ballRef.current, x, y, 1, eased * 160);
      setElementTransform(shadowRef.current, x + 8, y + 28, 1 - eased * 0.08);

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(frame);
      } else {
        setIsLanded(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(frame);
  }, [clearAnimation, syncLayoutPoints]);

  const animateShot = useCallback((start, end, shotPower = 0.7) => {
    clearAnimation();
    syncLayoutPoints(false);
    setIsAiming(false);
    setIsShooting(true);
    setIsLanded(false);

    const normalizedPower = clamp(shotPower, 0.25, 1);
    const control = getShotControlPoint(start, end, normalizedPower);
    const duration = reducedMotionRef.current ? 280 : Math.round(980 + (1 - normalizedPower) * 260);
    const startedAt = performance.now();
    const dotCount = reducedMotionRef.current ? 8 : Math.round(12 + normalizedPower * 8);
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect) {
      setTrajectoryPoints(getTrajectoryPercentPoints(start, control, end, dotCount, rect));
    }

    const frame = (now) => {
      const t = clamp((now - startedAt) / duration, 0, 1);
      const eased = easeOutCubic(t);
      const point = reducedMotionRef.current
        ? { x: lerp(start.x, end.x, eased), y: lerp(start.y, end.y, eased) }
        : getBezierPoint(start, control, end, eased);
      const lift = Math.sin(t * Math.PI);
      const scale = 1 - lift * 0.12;
      const shadowScale = clamp(1 - lift * 0.45, 0.45, 1);

      ballPositionRef.current = point;
      setElementTransform(ballRef.current, point.x, point.y, scale, eased * 720);
      setElementTransform(
        shadowRef.current,
        lerp(start.x, end.x, eased) + 8,
        lerp(start.y, end.y, eased) + 28,
        shadowScale
      );

      if (shadowRef.current) {
        shadowRef.current.style.opacity = `${clamp(0.28 - lift * 0.14, 0.1, 0.28)}`;
      }

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(frame);
        return;
      }

      setIsShooting(false);
      setIsLanded(true);
      setTrajectoryPoints([]);
      if (rippleRef.current) {
        rippleRef.current.classList.remove("is-active");
        void rippleRef.current.offsetWidth;
        rippleRef.current.classList.add("is-active");
      }

      resetTimerRef.current = setTimeout(() => resetBall(true), RESET_DELAY);
    };

    animationFrameRef.current = requestAnimationFrame(frame);
  }, [clearAnimation, resetBall, syncLayoutPoints]);

  const triggerAutoShot = useCallback(() => {
    syncLayoutPoints(true);
    const start = startPointRef.current;
    const end = holePointRef.current;
    const control = getShotControlPoint(start, end, 0.68);
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect) {
      setTrajectoryPoints(getTrajectoryPercentPoints(start, control, end, 16, rect));
    }
    window.setTimeout(() => animateShot(start, end, 0.68), 120);
  }, [animateShot, syncLayoutPoints]);

  const handleBallPointerDown = useCallback((event) => {
    if (isShooting) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    clearAnimation();
    syncLayoutPoints(false);

    const startPoint = startPointRef.current;
    dragRef.current = {
      pointerId: event.pointerId,
      pointerStart: { x: event.clientX, y: event.clientY },
      active: true,
    };

    ballPositionRef.current = startPoint;
    setIsAiming(true);
    setIsLanded(false);
    setPower(0);
  }, [clearAnimation, isShooting, syncLayoutPoints]);

  const handlePointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag?.active || drag.pointerId !== event.pointerId) return;

    const rawDrag = {
      x: event.clientX - drag.pointerStart.x,
      y: event.clientY - drag.pointerStart.y,
    };
    const dragDistance = distance({ x: 0, y: 0 }, rawDrag);
    const limitedDistance = Math.min(dragDistance, MAX_DRAG);
    const ratio = dragDistance > 0 ? limitedDistance / dragDistance : 0;
    const limitedDrag = { x: rawDrag.x * ratio, y: rawDrag.y * ratio };
    const currentPower = getPowerFromDrag(limitedDistance, MAX_DRAG);
    const startPoint = startPointRef.current;
    const pulledBall = {
      x: startPoint.x + limitedDrag.x * 0.32,
      y: startPoint.y + limitedDrag.y * 0.32,
    };
    const end = holePointRef.current;
    const control = getShotControlPoint(pulledBall, end, currentPower);
    const rect = stageRef.current?.getBoundingClientRect();

    ballPositionRef.current = pulledBall;
    setElementTransform(ballRef.current, pulledBall.x, pulledBall.y, 1 + currentPower * 0.04, limitedDrag.x * 0.35);
    setElementTransform(shadowRef.current, pulledBall.x + 8, pulledBall.y + 28, 1);
    setPower(currentPower);
    if (rect) {
      setTrajectoryPoints(
        getTrajectoryPercentPoints(pulledBall, control, end, Math.round(12 + currentPower * 8), rect)
      );
    }
  }, []);

  const handlePointerUp = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag?.active || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const start = ballPositionRef.current;
    const end = holePointRef.current;
    const dragDistance = distance(drag.pointerStart, { x: event.clientX, y: event.clientY });

    if (dragDistance < MIN_SHOOT_DRAG) {
      resetBall(true);
      return;
    }

    animateShot(start, end, getPowerFromDrag(Math.min(dragDistance, MAX_DRAG), MAX_DRAG));
  }, [animateShot, resetBall]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    reducedMotionRef.current = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    syncLayoutPoints(true);

    const onResize = () => syncLayoutPoints(!isShooting && !isAiming);
    const onLoginSuccess = () => triggerAutoShot();

    window.addEventListener("resize", onResize);
    window.addEventListener("golf-login-success", onLoginSuccess);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("golf-login-success", onLoginSuccess);
      clearAnimation();
    };
  }, [clearAnimation, isAiming, isShooting, syncLayoutPoints, triggerAutoShot]);

  return useMemo(() => ({
    stageRef,
    ballRef,
    shadowRef,
    rippleRef,
    isAiming,
    isShooting,
    isLanded,
    power,
    trajectoryPoints,
    holePosition: HOLE_POSITION,
    ballStartPosition: BALL_START_POSITION,
    handleBallPointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel: resetBall,
  }), [
    handleBallPointerDown,
    handlePointerMove,
    handlePointerUp,
    isAiming,
    isLanded,
    isShooting,
    power,
    resetBall,
    trajectoryPoints,
  ]);
};
