import { useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  isPast,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScheduledContent, PLATFORMS } from "@/types/scheduling";
import { ScheduleCardCompact } from "./ScheduleCardCompact";

interface WeeklyScheduleViewProps {
  schedules: ScheduledContent[];
  onMarkPosted: (id: string) => void;
  onSendReminder: (id: string) => void;
  onDelete: (id: string) => void;
}

export const WeeklyScheduleView = ({
  schedules,
  onMarkPosted,
  onSendReminder,
  onDelete,
}: WeeklyScheduleViewProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  const getSchedulesForDay = (date: Date) => {
    return schedules.filter((s) =>
      isSameDay(new Date(s.scheduled_at), date)
    );
  };

  const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="space-y-4 overflow-hidden">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(currentWeekStart, "MMMM yyyy", { locale: localeId })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hari Ini
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop: Weekly Grid */}
      <div className="hidden md:grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const daySchedules = getSchedulesForDay(day);
          const postCount = daySchedules.length;

          return (
            <div key={day.toISOString()} className="min-h-[400px]">
              <div
                className={`mb-3 pb-2 border-b ${
                  isToday(day) ? "border-primary" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {format(day, "EEEE", { locale: localeId })}
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      isToday(day) ? "text-primary" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {postCount} Post
                </p>
              </div>

              <div className="space-y-3">
                {daySchedules.length === 0 ? (
                  <div className="h-20 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground/50">-</p>
                  </div>
                ) : (
                  daySchedules.map((schedule) => (
                    <ScheduleCardCompact
                      key={schedule.id}
                      schedule={schedule}
                      onMarkPosted={onMarkPosted}
                      onSendReminder={onSendReminder}
                      onDelete={onDelete}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical list */}
      <div className="md:hidden space-y-3">
        {weekDays.map((day) => {
          const daySchedules = getSchedulesForDay(day);
          const postCount = daySchedules.length;

          return (
            <div
              key={day.toISOString()}
              className={`rounded-lg border p-3 ${
                isToday(day) ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-bold ${
                      isToday(day) ? "text-primary" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {format(day, "EEEE", { locale: localeId })}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {postCount} Post
                </span>
              </div>

              {daySchedules.length > 0 && (
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <ScheduleCardCompact
                      key={schedule.id}
                      schedule={schedule}
                      onMarkPosted={onMarkPosted}
                      onSendReminder={onSendReminder}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
