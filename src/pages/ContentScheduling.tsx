import { useState } from "react";
import { Plus, CalendarClock } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScheduleForm } from "@/components/scheduling/ScheduleForm";
import { ScheduleList } from "@/components/scheduling/ScheduleList";
import { useScheduledContent } from "@/hooks/useScheduledContent";

const ContentScheduling = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    schedules,
    isLoading,
    createSchedule,
    markAsPosted,
    sendReminder,
    deleteSchedule,
  } = useScheduledContent();

  const handleCreateSchedule = async (data: Parameters<typeof createSchedule>[0]) => {
    const result = await createSchedule(data);
    if (result) {
      setIsDialogOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            icon={CalendarClock}
            title="Content Scheduling"
            description="Jadwalkan konten dan terima reminder otomatis via Email atau WhatsApp"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Buat Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Buat Jadwal Konten Baru</DialogTitle>
              </DialogHeader>
              <ScheduleForm onSubmit={handleCreateSchedule} />
            </DialogContent>
          </Dialog>
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
