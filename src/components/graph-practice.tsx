"use client";

import { useMemo, useState } from "react";
import { Badge, Card } from "@/components/ui";

export function GraphPractice() {
  const [demandIntercept, setDemandIntercept] = useState(60);
  const [supplyIntercept, setSupplyIntercept] = useState(8);
  const [tax, setTax] = useState(0);
  const [quantityGuess, setQuantityGuess] = useState("");
  const [priceGuess, setPriceGuess] = useState("");
  const [feedback, setFeedback] = useState("");

  const values = useMemo(() => {
    const demandSlope = 1;
    const supplySlope = 1;
    const q = Math.max(0, (demandIntercept - supplyIntercept - tax) / (demandSlope + supplySlope));
    const buyerPrice = demandIntercept - demandSlope * q;
    const sellerPrice = buyerPrice - tax;
    const noTaxQ = (demandIntercept - supplyIntercept) / 2;
    const dwl = 0.5 * Math.max(0, noTaxQ - q) * tax;
    const revenue = tax * q;
    return { q, buyerPrice, sellerPrice, dwl, revenue };
  }, [demandIntercept, supplyIntercept, tax]);

  function check() {
    const qGuess = Number(quantityGuess);
    const pGuess = Number(priceGuess);
    const qOk = Math.abs(qGuess - values.q) <= 1;
    const pOk = Math.abs(pGuess - values.buyerPrice) <= 1;
    if (qOk && pOk) {
      setFeedback("Correct. You identified the traded quantity and buyer price within rounding tolerance.");
    } else {
      setFeedback(
        `Check the intersection after the tax wedge. Target values: Q = ${values.q.toFixed(1)}, buyer price = ${values.buyerPrice.toFixed(1)}, seller price = ${values.sellerPrice.toFixed(1)}.`,
      );
    }
  }

  const demandPoints = `40,40 320,${40 + demandIntercept * 3.5}`;
  const supplyPoints = `40,${300 - supplyIntercept * 2.2} 320,80`;
  const shiftedSupplyPoints = `40,${300 - (supplyIntercept + tax) * 2.2} 320,${80 - tax * 2.2}`;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <Card>
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge>Demand and supply</Badge>
            <Badge>Tax wedge</Badge>
            <Badge>Surplus areas</Badge>
          </div>
          <svg viewBox="0 0 360 340" className="h-[420px] w-full rounded-md border border-[color:var(--line)] bg-white dark:bg-[#111613]">
            <line x1="40" y1="300" x2="330" y2="300" stroke="currentColor" strokeWidth="1" />
            <line x1="40" y1="300" x2="40" y2="30" stroke="currentColor" strokeWidth="1" />
            <polyline points={demandPoints} fill="none" stroke="#0f766e" strokeWidth="3" />
            <polyline points={supplyPoints} fill="none" stroke="#8f2d56" strokeWidth="3" />
            {tax > 0 ? <polyline points={shiftedSupplyPoints} fill="none" stroke="#9a6a00" strokeWidth="3" strokeDasharray="8 6" /> : null}
            <circle cx={40 + values.q * 4.7} cy={300 - values.buyerPrice * 3.6} r="5" fill="#0f766e" />
            {tax > 0 ? (
              <>
                <line
                  x1={40 + values.q * 4.7}
                  x2={40 + values.q * 4.7}
                  y1={300 - values.buyerPrice * 3.6}
                  y2={300 - values.sellerPrice * 3.6}
                  stroke="#9a6a00"
                  strokeWidth="4"
                />
                <text x={48 + values.q * 4.7} y={298 - ((values.buyerPrice + values.sellerPrice) / 2) * 3.6} fontSize="12" fill="currentColor">
                  tax wedge
                </text>
              </>
            ) : null}
            <text x="306" y="322" fontSize="12" fill="currentColor">Q</text>
            <text x="14" y="40" fontSize="12" fill="currentColor">P</text>
            <text x="258" y="110" fontSize="12" fill="#0f766e">Demand</text>
            <text x="250" y="78" fontSize="12" fill="#8f2d56">Supply</text>
          </svg>
        </div>
      </Card>
      <Card>
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Graph practice</h2>
          <label className="grid gap-2 text-sm">
            Demand intercept
            <input type="range" min="40" max="80" value={demandIntercept} onChange={(event) => setDemandIntercept(Number(event.target.value))} />
          </label>
          <label className="grid gap-2 text-sm">
            Supply intercept
            <input type="range" min="0" max="20" value={supplyIntercept} onChange={(event) => setSupplyIntercept(Number(event.target.value))} />
          </label>
          <label className="grid gap-2 text-sm">
            Per-unit tax
            <input type="range" min="0" max="18" value={tax} onChange={(event) => setTax(Number(event.target.value))} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="min-h-10 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-3"
              placeholder="Q"
              value={quantityGuess}
              onChange={(event) => setQuantityGuess(event.target.value)}
            />
            <input
              className="min-h-10 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] px-3"
              placeholder="Buyer price"
              value={priceGuess}
              onChange={(event) => setPriceGuess(event.target.value)}
            />
          </div>
          <button className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white" onClick={check}>
            Check graph answer
          </button>
          <div className="rounded-md border border-[color:var(--line)] p-3 text-sm text-[color:var(--muted)]">
            <p>Tax revenue: {values.revenue.toFixed(1)}</p>
            <p>Deadweight loss: {values.dwl.toFixed(1)}</p>
            {feedback ? <p className="mt-2 text-[color:var(--foreground)]">{feedback}</p> : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
