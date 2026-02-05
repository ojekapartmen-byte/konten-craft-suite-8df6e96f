import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isSameMonth } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScheduledContent, PLATFORMS } from "@/types/scheduling";
import { Badge } from "@/components/ui/badge";

interface CalendarViewProps {
  schedules: ScheduledContent[];
  onMarkPosted: (id: string) => void;
  onSendReminder: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CalendarView = ({
  schedules,
  onMarkPosted,
  onSendReminder,
  onDelete,
}: CalendarViewProps) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSchedulesForDay = (date: Date) => {
    return schedules.filter((s) => isSameDay(new Date(s.scheduled_at), date));
  };

  const getPlatformInfo = (platform: string) => {
    return PLATFORMS.find((p) => p.value === platform) || { icon: "📌", label: platform };
  };

  const getStatusColor = (status: string, scheduledAt: string) => {
    const isOverdue = new Date(scheduledAt) < new Date() && status === "scheduled";
    if (status === "posted") return "bg-green-500/20 text-green-700 dark:text-green-400";
    if (isOverdue) return "bg-destructive/20 text-destructive";
    return "bg-primary/20 text-primary";
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold ml-2">
            {format(currentMonth, "MMMM yyyy", { locale: localeId })}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Hari Ini
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground border-b"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const daySchedules = getSchedulesForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[100px] p-1 border-b border-r last:border-r-0",
                  "[&:nth-child(7n)]:border-r-0",
                  !isCurrentMonth && "bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center mb-1",
                    isToday(day) && "bg-primary text-primary-foreground",
                    !isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </div>

                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((schedule) => {
                    const platformInfo = getPlatformInfo(schedule.platform);
                    return (
                      <div
                        key={schedule.id}
                        onClick={() => navigate(`/scheduling/${schedule.id}`)}
                        className={cn(
                          "text-xs p-1 rounded cursor-pointer truncate hover:ring-1 hover:ring-primary/50 transition-all",
                          getStatusColor(schedule.status, schedule.scheduled_at)
                        )}
                      >
                        <span className="mr-1">{platformInfo.icon}</span>
                        {schedule.title}
                      </div>
                    );
                  })}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{daySchedules.length - 3} lainnya
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
