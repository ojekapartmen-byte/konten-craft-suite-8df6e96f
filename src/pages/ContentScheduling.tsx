import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CalendarClock, List, CalendarDays, LayoutGrid } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ScheduleList } from "@/components/scheduling/ScheduleList";
import { CalendarView } from "@/components/scheduling/CalendarView";
import { WeeklyScheduleView } from "@/components/scheduling/WeeklyScheduleView";
import { useScheduledContent } from "@/hooks/useScheduledContent";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ContentScheduling = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "weekly" | "calendar">("list");
  const {
    schedules,
    isLoading,
    markAsPosted,
    sendReminder,
    deleteSchedule,
  } = useScheduledContent();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            icon={CalendarClock}
            title="Content Scheduling"
            description="Jadwalkan konten dan terima reminder otomatis"
          />
          <div className="flex items-center gap-2 md:gap-3">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "list" | "weekly" | "calendar")}
              className="shrink-0"
            >
              <ToggleGroupItem value="list" aria-label="List view" className="h-8 w-8 md:h-9 md:w-9">
                <List className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="weekly" aria-label="Weekly view" className="h-8 w-8 md:h-9 md:w-9">
                <LayoutGrid className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="calendar" aria-label="Calendar view" className="h-8 w-8 md:h-9 md:w-9">
                <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={() => navigate("/scheduling/create")} size="sm" className="md:size-default">
              <Plus className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Buat Jadwal</span>
              <span className="sm:hidden">Baru</span>
            </Button>
          </div>
        </div>

        {viewMode === "list" && (
          <ScheduleList
            schedules={schedules}
            isLoading={isLoading}
            onMarkPosted={markAsPosted}
            onSendReminder={sendReminder}
            onDelete={deleteSchedule}
          />
        )}
        {viewMode === "weekly" && (
          <WeeklyScheduleView
            schedules={schedules}
            onMarkPosted={markAsPosted}
            onSendReminder={sendReminder}
            onDelete={deleteSchedule}
          />
        )}
        {viewMode === "calendar" && (
          <CalendarView
            schedules={schedules}
            onMarkPosted={markAsPosted}
            onSendReminder={sendReminder}
            onDelete={deleteSchedule}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ContentScheduling;
