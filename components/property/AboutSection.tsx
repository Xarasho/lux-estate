"use client";

import React, { useState } from "react";

export interface AboutSectionProps {
  description: string;
}

export function AboutSection({ description }: AboutSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split description into paragraphs
  const paragraphs = description.split("\n\n").filter(Boolean);

  const defaultParagraphs =
    paragraphs.length > 0
      ? paragraphs
      : [
          "Experience modern luxury in this architecturally stunning home located in the heart of Palo Alto. Designed with an emphasis on indoor-outdoor living, the residence features floor-to-ceiling glass walls that flood the interiors with natural light.",
          "The open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts. Retreat to the primary suite, a sanctuary of relaxation with a spa-inspired bath and private balcony.",
        ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
      <h2 className="text-lg font-semibold mb-4 text-nordic">About this home</h2>
      <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed space-y-4">
        <p>{defaultParagraphs[0]}</p>
        {defaultParagraphs.length > 1 && (
          <p className={isExpanded ? "block" : "hidden sm:block"}>
            {defaultParagraphs[1]}
          </p>
        )}
        {isExpanded && defaultParagraphs.slice(2).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {isExpanded && defaultParagraphs.length <= 2 && (
          <p className="text-nordic/60 text-sm italic">
            This residence is outfitted with energy-efficient systems, custom architectural millwork, and private landscaped outdoor entertaining spaces. Contact the listing agent for full specifications and building blueprints.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 text-mosque font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
      >
        <span>{isExpanded ? "Show less" : "Read more"}</span>
        <span className="material-icons text-sm">
          {isExpanded ? "arrow_upward" : "arrow_forward"}
        </span>
      </button>
    </div>
  );
}
