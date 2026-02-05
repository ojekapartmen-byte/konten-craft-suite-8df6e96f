import { useNavigate } from "react-router-dom";
import { CalendarPlus, ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { ScheduleForm } from "@/components/scheduling/ScheduleForm";
import { useScheduledContent } from "@/hooks/useScheduledContent";

const CreateSchedule = () => {
  const navigate = useNavigate();
  const { createSchedule } = useScheduledContent();

  const handleCreateSchedule = async (data: Parameters<typeof createSchedule>[0]) => {
    const result = await createSchedule(data);
    if (result) {
      navigate("/scheduling");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/scheduling")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHeader
            icon={CalendarPlus}
            title="Buat Jadwal Konten Baru"
            description="Jadwalkan konten dan terima reminder otomatis via Email atau WhatsApp"
          />
        </div>

        <ScheduleForm onSubmit={handleCreateSchedule} />
      </div>
    </MainLayout>
  );
};

export default CreateSchedule;
