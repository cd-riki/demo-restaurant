import { useEffect, useState } from "react";
import { ORDER_STEPS } from "../data.js";
import { formatHM } from "../utils.js";

function stepIndexForFraction(fraction) {
  if (fraction < 0.1) return 0;
  if (fraction < 0.4) return 1;
  if (fraction < 0.85) return 2;
  return 3;
}

export default function OrderTracker({ order, onDismiss }) {
  const [now, setNow] = useState(Date.now());
  const [expanded, setExpanded] = useState(false);
  const [delay, setDelay] = useState(null);
  const [delayToast, setDelayToast] = useState(false);
  const [committedStep, setCommittedStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulated kitchen delay: this demo has no real logistics feed, so a
    // single delay event may fire partway through the original ETA to
    // exercise the "ETA changed significantly" notice from the spec.
    const delayAt = order.etaMinutes * 60000 * (0.3 + Math.random() * 0.3);
    const timer = setTimeout(() => {
      if (Math.random() < 0.6) {
        const extraMinutes = 6 + Math.round(Math.random() * 6);
        setDelay({ extraMinutes, message: "Léger retard en cuisine" });
        setDelayToast(true);
      }
    }, delayAt);
    return () => clearTimeout(timer);
  }, [order.etaMinutes]);

  useEffect(() => {
    if (!delayToast) return;
    const timer = setTimeout(() => setDelayToast(false), 8000);
    return () => clearTimeout(timer);
  }, [delayToast]);

  const totalMs = (order.etaMinutes + (delay?.extraMinutes || 0)) * 60000;
  const elapsedMs = now - order.startedAt;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const remainingMin = Math.ceil(remainingMs / 60000);
  const delivered = remainingMs <= 0;
  const arrivalTime = new Date(order.startedAt + totalMs);

  // Step progression is paced against the original ETA (not the delayed
  // total) and only ever moves forward, so a kitchen delay extends the
  // countdown without making the order look like it regressed a stage.
  const baseFraction = Math.min(1, elapsedMs / (order.etaMinutes * 60000));
  const nominalStep = stepIndexForFraction(baseFraction);
  useEffect(() => {
    if (nominalStep > committedStep) setCommittedStep(nominalStep);
  }, [nominalStep, committedStep]);
  const stepIndex = delivered ? ORDER_STEPS.length - 1 : committedStep;

  return (
    <div className="order-tracker">
      <button
        type="button"
        className={`order-tracker-chip${delivered ? " delivered" : ""}`}
        onClick={() => (delivered ? onDismiss() : setExpanded((e) => !e))}
      >
        <span className="eta-dot" />
        <span className="eta-icon">{delivered ? "✅" : "🛵"}</span>
        {delivered ? "Commande livrée !" : `${ORDER_STEPS[stepIndex]} · ${remainingMin} min`}
      </button>

      {delayToast && delay && (
        <div className="order-toast">
          ⚠️ {delay.message} — nouvelle arrivée estimée {formatHM(arrivalTime)}
          <button type="button" className="order-toast-close" onClick={() => setDelayToast(false)}>✕</button>
        </div>
      )}

      {expanded && !delivered && (
        <div className="order-tracker-panel">
          <p className="order-tracker-eta">Arrivée estimée à {formatHM(arrivalTime)}</p>
          <ul className="order-tracker-steps">
            {ORDER_STEPS.map((label, i) => (
              <li
                key={label}
                className={`order-tracker-step${i < stepIndex ? " done" : ""}${i === stepIndex ? " active" : ""}`}
              >
                {label}
              </li>
            ))}
          </ul>
          {delay && <p className="order-tracker-delay">⚠️ {delay.message}</p>}
          <p className="order-tracker-address">Livraison à {order.address}</p>
        </div>
      )}
    </div>
  );
}
