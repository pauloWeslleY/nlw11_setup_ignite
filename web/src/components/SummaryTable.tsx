import { HabitDay } from "./HabitDay";

import { generateDateFromYearBeginning } from "../utils/generate-date-from-year-beginning";
import { api } from "../lib/axios";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const weekDay = ["D", "S", "T", "Q", "Q", "S", "S"];

const summaryDates = generateDateFromYearBeginning();

const minimumSummaryDatesSize = 18 * 7; //! 18 weeks
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;

type SummaryProps = Array<{
   id: string;
   date: string;
   amount: number;
   completed: number;
}>;

export function SummaryTable() {
   const [summary, setSummary] = useState<SummaryProps>([]);

   useEffect(() => {
      api.get("/summary").then((response) => {
         setSummary(response.data);
      });
   }, []);

   return (
      <div className="w-full flex">
         <div className="grid grid-rows-7 grid-flow-row gap-3">
            {weekDay.map((weekDay, index) => {
               return (
                  <div
                     key={`${weekDay}-${index}`}
                     className="text-zinc-400 text-xl font-bold h-10 w-10 flex items-center justify-center"
                  >
                     {weekDay}
                  </div>
               );
            })}
         </div>

         <div className="grid grid-rows-7 grid-flow-col gap-3">
            {summary.length > 0 &&
               summaryDates.map((date) => {
                  const dayInSummary = summary.find((day) => {
                     return dayjs(date).isSame(day.date, "day");
                  });

                  return (
                     <HabitDay
                        key={date.toString()}
                        date={date}
                        amount={dayInSummary?.amount}
                        defaultCompleted={dayInSummary?.completed}
                     />
                  );
               })}

            {amountOfDaysToFill > 0 &&
               Array.from({ length: amountOfDaysToFill }).map((_, index) => {
                  return (
                     <div
                        key={index}
                        className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
                     />
                  );
               })}
         </div>
      </div>
   );
}
