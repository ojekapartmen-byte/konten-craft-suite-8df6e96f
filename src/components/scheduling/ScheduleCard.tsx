import { format, isPast, isToday, isTomorrow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Download,
  Copy,
  Bell,
  CheckCircle,
  Trash2,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScheduledContent, PLATFORMS } from "@/types/scheduling";
import { useToast } from "@/hooks/use-toast";

interface ScheduleCardProps {
  schedule: ScheduledContent;
  onMarkPosted: (id: string) => void;
  onSendReminder: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ScheduleCard = ({
  schedule,
  onMarkPosted,
  onSendReminder,
  onDelete,
}: ScheduleCardProps) => {
  const { toast } = useToast();
  const platform = PLATFORMS.find((p) => p.value === schedule.platform);
  const scheduledDate = new Date(schedule.scheduled_at);
  const isOverdue = isPast(scheduledDate) && schedule.status === "scheduled";

  const getDateLabel = () => {
    if (isToday(scheduledDate)) return "Hari ini";
    if (isTomorrow(scheduledDate)) return "Besok";
    return format(scheduledDate, "dd MMM yyyy", { locale: localeId });
  };

  const getStatusBadge = () => {
    switch (schedule.status) {
      case "posted":
        return <Badge variant="default">Sudah Diposting</Badge>;
      case "reminded":
        return <Badge variant="secondary">Reminder Terkirim</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return isOverdue ? (
          <Badge variant="destructive">Terlewat</Badge>
        ) : (
          <Badge variant="outline">Terjadwal</Badge>
        );
    }
  };

  const copyCaption = () => {
    if (schedule.caption) {
      const fullCaption = schedule.hashtags?.length
        ? `${schedule.caption}\n\n${schedule.hashtags.join(" ")}`
        : schedule.caption;
      navigator.clipboard.writeText(fullCaption);
      toast({ title: "Caption disalin!" });
    }
  };

  const downloadVideo = () => {
    if (schedule.video_url) {
      const link = document.createElement("a");
      link.href = schedule.video_url;
      link.download = `${schedule.title}.mp4`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Mengunduh video..." });
    }
  };

  return (
    <Card className={`glass-card transition-all ${isOverdue ? "border-destructive/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl">{platform?.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{schedule.title}</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {platform?.label}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {getDateLabel()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(scheduledDate, "HH:mm")}
                </span>
              </div>
              {schedule.caption && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {schedule.caption}
                </p>
              )}
              {schedule.hashtags && schedule.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {schedule.hashtags.slice(0, 5).map((tag, i) => (
                    <span key={i} className="text-xs text-primary">
                      {tag}
                    </span>
                  ))}
                  {schedule.hashtags.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{schedule.hashtags.length - 5} lainnya
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {schedule.caption && (
              <Button variant="ghost" size="icon" onClick={copyCaption} title="Salin Caption">
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {schedule.video_url && (
              <Button variant="ghost" size="icon" onClick={downloadVideo} title="Download Video">
                <Download className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {schedule.status === "scheduled" && (
                  <>
                    <DropdownMenuItem onClick={() => onSendReminder(schedule.id)}>
                      <Bell className="h-4 w-4 mr-2" />
                      Kirim Reminder Sekarang
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMarkPosted(schedule.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Tandai Sudah Diposting
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {schedule.video_url && (
                  <DropdownMenuItem onClick={() => window.open(schedule.video_url!, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Buka Video
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(schedule.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Jadwal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
