import { generateDateFromYearBeginning } from "../utils/generate-date-from-year-beginning";
import { HabitDay } from "./HabitDay";

const weekDay = ["D", "S", "T", "Q", "Q", "S", "S"];

const summaryDates = generateDateFromYearBeginning();

const minimumSummaryDatesSize = 18 * 7; // 18 weeks
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;

export function SummaryTable() {
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
            {summaryDates.map((date) => {
               return <HabitDay key={date.toString()} />;
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
