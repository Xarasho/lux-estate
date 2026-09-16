"use client";

import React, { useState, useMemo } from "react";

export interface MortgageCalculatorProps {
  price: number;
  dict?: any;
}

export function MortgageCalculator({ price, dict }: MortgageCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [interestRate, setInterestRate] = useState(6.5);

  const calculateMonthly = (p: number, downPct: number, years: number, rate: number) => {
    const principal = p * (1 - downPct / 100);
    const monthlyRate = rate / 100 / 12;
    const totalPayments = years * 12;
    if (monthlyRate === 0) return principal / totalPayments;
    const monthly =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return Math.round(monthly);
  };

  const defaultMonthly = useMemo(() => {
    return calculateMonthly(price, 20, 30, 6.5);
  }, [price]);

  const currentMonthly = useMemo(() => {
    return calculateMonthly(price, downPaymentPercent, loanTermYears, interestRate);
  }, [price, downPaymentPercent, loanTermYears, interestRate]);

  const formattedDefaultMonthly = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(defaultMonthly);

  const formattedCurrentMonthly = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(currentMonthly);

  const downPaymentAmount = Math.round(price * (downPaymentPercent / 100));

  const mo = dict?.month || "mo";

  return (
    <>
      <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-full text-mosque shadow-sm">
            <span className="material-icons">calculate</span>
          </div>
          <div>
            <h3 className="font-semibold text-nordic">{dict?.estimated_payment || "Estimated Payment"}</h3>
            <p className="text-sm text-nordic/60">
              {dict?.starting_from || "Starting from"}{" "}
              <strong className="text-mosque">{formattedDefaultMonthly}/{mo}</strong>{" "}
              {dict?.with_down || "with 20% down"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="whitespace-nowrap px-4 py-2 bg-white border border-nordic/10 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic cursor-pointer shadow-sm hover:shadow"
        >
          {dict?.calculate_mortgage || "Calculate Mortgage"}
        </button>
      </div>

      {/* Interactive Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-mosque/10 relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close calculator"
              className="absolute top-4 right-4 p-2 text-nordic/50 hover:text-nordic transition-colors cursor-pointer"
            >
              <span className="material-icons">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-mosque/10 rounded-lg text-mosque">
                <span className="material-icons">calculate</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-nordic">{dict?.mortgage_calculator || "Mortgage Calculator"}</h3>
                <p className="text-xs text-nordic/60">{dict?.customize_financing || "Customize financing options for this home"}</p>
              </div>
            </div>

            {/* Monthly payment display */}
            <div className="bg-clear-day p-5 rounded-xl text-center mb-6 border border-mosque/10">
              <span className="text-xs font-semibold text-nordic/60 uppercase tracking-wider">
                {dict?.estimated_monthly || "Estimated Monthly Payment"}
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-mosque mt-1">
                {formattedCurrentMonthly}
                <span className="text-sm font-normal text-nordic/60">/{mo}</span>
              </div>
            </div>

            <div className="space-y-5 text-sm">
              {/* Down payment */}
              <div>
                <div className="flex justify-between font-medium text-nordic mb-1.5">
                  <span>{dict?.down_payment || "Down Payment"} ({downPaymentPercent}%)</span>
                  <span className="font-semibold text-mosque">
                    ${downPaymentAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-mosque cursor-pointer"
                />
              </div>

              {/* Loan Term */}
              <div>
                <span className="block font-medium text-nordic mb-1.5">{dict?.loan_term || "Loan Term"}</span>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 20, 30].map((years) => (
                    <button
                      key={years}
                      type="button"
                      onClick={() => setLoanTermYears(years)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        loanTermYears === years
                          ? "bg-mosque text-white border-mosque shadow-sm"
                          : "border-nordic/10 text-nordic/70 hover:border-mosque"
                      }`}
                    >
                      {years} {dict?.years || "Years"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between font-medium text-nordic mb-1.5">
                  <span>{dict?.interest_rate || "Interest Rate"}</span>
                  <span className="font-semibold text-mosque">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="12.0"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-mosque cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full py-3 bg-mosque hover:bg-primary-hover text-white font-medium rounded-lg shadow-md transition-all cursor-pointer"
            >
              {dict?.done || "Done"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
