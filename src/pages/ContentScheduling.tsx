import { useNavigate } from "react-router-dom";
import { Plus, CalendarClock } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ScheduleList } from "@/components/scheduling/ScheduleList";
import { useScheduledContent } from "@/hooks/useScheduledContent";

const ContentScheduling = () => {
  const navigate = useNavigate();
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
          <Button onClick={() => navigate("/scheduling/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Jadwal
          </Button>
        </div>

        <ScheduleList
          schedules={schedules}
          isLoading={isLoading}
          onMarkPosted={markAsPosted}
          onSendReminder={sendReminder}
          onDelete={deleteSchedule}
        />
      </div>
    </MainLayout>
  );
};

export default ContentScheduling;
