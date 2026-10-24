"use client";

import { createContext, useContext } from "react";
import { type MotionValue, motion, useScroll, useTransform } from "framer-motion";

// `meal` runs 0 at the door to 1 at the check. One value, read by everything.
const MealContext = createContext<MotionValue<number> | null>(null);

export function useMeal() {
  const meal = useContext(MealContext);
  if (!meal) throw new Error("useMeal must be used inside <MealProvider>");
  return meal;
}

function Tint() {
  const meal = useMeal();
  // Afternoon cream toward warm evening. Text pairs stay above 4.5:1.
  const background = useTransform(meal, [0, 1], ["#F6EEDD", "#EDDDBD"]);
  return <motion.div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background }} />;
}

export function MealProvider({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  return (
    <MealContext.Provider value={scrollYProgress}>
      <Tint />
      {children}
    </MealContext.Provider>
  );
}
