import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma";

export async function appRoutes(app: FastifyInstance) {
   //! Routes Habits
   app.post("/habits", async (request) => {
      const createHabitBody = z.object({
         title: z.string(),
         weekDays: z.array(z.number().min(0).max(6)),
      });

      const { title, weekDays } = createHabitBody.parse(request.body);

      const today = dayjs().startOf("day").toDate();

      await prisma.habit.create({
         data: {
            title,
            created_at: today,
            weekDays: {
               create: weekDays.map((weekDay) => {
                  return {
                     week_day: weekDay,
                  };
               }),
            },
         },
      });
   });

   //! Routes Day
   app.get("/day", async (request) => {
      const getDayParams = z.object({
         date: z.coerce.date(),
      });

      const { date } = getDayParams.parse(request.query);

      const parseDate = dayjs(date).startOf("day");
      const weekDay = parseDate.get("day");

      console.log(date, weekDay);
      //[] todos os hábitos possíveis
      //[] hábitos que ja foram completados

      const possibleHabits = await prisma.habit.findMany({
         where: {
            created_at: {
               lte: date,
            },
            weekDays: {
               some: {
                  week_day: weekDay,
               },
            },
         },
      });

      const day = await prisma.day.findUnique({
         where: {
            date: parseDate.toDate(),
         },
         include: {
            dayHabits: true,
         },
      });

      const completedHabits = day?.dayHabits.map((dayHabit) => {
         return dayHabit.habit_id;
      }) ?? [];

      return {
         possibleHabits,
         completedHabits,
      };
   });

   //! Routes Completar ou Não Completar um hábito
   app.patch("/habits/:id/toggle", async (request) => {
      //* route param => parâmetro de identificação

      const toggleHabitParams = z.object({
         id: z.string().uuid(),
      });

      const { id } = toggleHabitParams.parse(request.params);

      const today = dayjs().startOf("day").toDate();

      let day = await prisma.day.findUnique({
         where: {
            date: today,
         },
      });

      if (!day) {
         day = await prisma.day.create({
            data: {
               date: today,
            },
         });
      }

      /*
         [] NOTE: Se ele encontrou a variável dayHabit que dizer q ele marcou
         [] o hábito como completo!!!!
      */
      const dayHabit = await prisma.dayHabit.findUnique({
         where: {
            day_id_habit_id: {
               day_id: day.id,
               habit_id: id,
            },
         },
      });

      if (dayHabit) {
         //[] NOTE: remover a marcação de completo
         await prisma.dayHabit.delete({
            where: {
               id: dayHabit.id,
            },
         });
      } else {
         //! TODO: Completar hábito nesse dia
         await prisma.dayHabit.create({
            data: {
               day_id: day.id,
               habit_id: id,
            },
         });
      }
   });

   app.get('/summary', async () => {
      /*
         ! [ { date: 17/01, amount: 5, completed: 1 }, { date: 18/01, amount: 2, completed: 2 }, {} ]
         [] Query mais complexa, mais condições, relacionamentos => SQL na mão (RAW)
         [] Prisma ORM: RAW SWL => SQLite
      */

      const summary = await prisma.$queryRaw`
         SELECT
            D.id,
            D.date,
            (
               SELECT
                  cast(count(*) as float)
               FROM day_habits DH
               WHERE DH.day_id = D.id
            ) as completed,
            (
               SELECT
                  cast(count(*) as float)
               FROM habit_week_days HWD
               JOIN habits H
                  ON H.id = HWD.habit_id
               WHERE
                  HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
                  AND H.created_at <= D.date
            ) as amount
         FROM days D
      `

      return summary
   })
}
