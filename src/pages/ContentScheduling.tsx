import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CalendarClock, List, CalendarDays } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ScheduleList } from "@/components/scheduling/ScheduleList";
import { CalendarView } from "@/components/scheduling/CalendarView";
import { useScheduledContent } from "@/hooks/useScheduledContent";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ContentScheduling = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
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
        <div className="flex items-center justify-between">
          <PageHeader
            icon={CalendarClock}
            title="Content Scheduling"
            description="Jadwalkan konten dan terima reminder otomatis via Email atau WhatsApp"
          />
          <div className="flex items-center gap-3">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "list" | "calendar")}
            >
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="calendar" aria-label="Calendar view">
                <CalendarDays className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={() => navigate("/scheduling/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Jadwal
            </Button>
          </div>
        </div>

        {viewMode === "list" ? (
          <ScheduleList
            schedules={schedules}
            isLoading={isLoading}
            onMarkPosted={markAsPosted}
            onSendReminder={sendReminder}
            onDelete={deleteSchedule}
          />
        ) : (
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
