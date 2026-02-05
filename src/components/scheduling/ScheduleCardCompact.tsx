import { useNavigate } from "react-router-dom";
import { format, isPast } from "date-fns";
import { Clock, MoreVertical, Bell, CheckCircle, Trash2, Copy, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScheduledContent, PLATFORMS } from "@/types/scheduling";
import { useToast } from "@/hooks/use-toast";

interface ScheduleCardCompactProps {
  schedule: ScheduledContent;
  onMarkPosted: (id: string) => void;
  onSendReminder: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ScheduleCardCompact = ({
  schedule,
  onMarkPosted,
  onSendReminder,
  onDelete,
}: ScheduleCardCompactProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const platform = PLATFORMS.find((p) => p.value === schedule.platform);
  const scheduledDate = new Date(schedule.scheduled_at);
  const isOverdue = isPast(scheduledDate) && schedule.status === "scheduled";
  const isPosted = schedule.status === "posted";

  const copyCaption = () => {
    if (schedule.caption) {
      const fullCaption = schedule.hashtags?.length
        ? `${schedule.caption}\n\n${schedule.hashtags.join(" ")}`
        : schedule.caption;
      navigator.clipboard.writeText(fullCaption);
      toast({ title: "Caption disalin!" });
    }
  };

  const getStatusColor = () => {
    if (isPosted) return "border-l-green-500";
    if (isOverdue) return "border-l-destructive";
    return "border-l-primary";
  };

  const handleCardClick = () => {
    navigate(`/scheduling/${schedule.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`overflow-hidden border-l-4 ${getStatusColor()} transition-all hover:shadow-md group cursor-pointer`}
    >
      <CardContent className="p-3">
        {/* Thumbnail */}
        {schedule.thumbnail_url && (
          <div className="relative mb-2 rounded-md overflow-hidden aspect-video bg-muted">
            <img
              src={schedule.thumbnail_url}
              alt={schedule.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm line-clamp-2 leading-tight">
            {schedule.title}
          </h4>

          {/* Time */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{format(scheduledDate, "HH:mm")}</span>
          </div>

          {/* Platform Icons & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span
                className={`text-lg ${
                  isPosted
                    ? "opacity-50"
                    : isOverdue
                    ? "grayscale"
                    : ""
                }`}
                title={platform?.label}
              >
                {platform?.icon}
              </span>
              {isPosted && (
                <span className="w-2 h-2 rounded-full bg-green-500" title="Sudah diposting" />
              )}
              {isOverdue && (
                <span className="w-2 h-2 rounded-full bg-destructive" title="Terlewat" />
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {schedule.caption && (
                  <DropdownMenuItem onClick={copyCaption}>
                    <Copy className="h-4 w-4 mr-2" />
                    Salin Caption
                  </DropdownMenuItem>
                )}
                {schedule.video_url && (
                  <DropdownMenuItem
                    onClick={() => window.open(schedule.video_url!, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Video
                  </DropdownMenuItem>
                )}
                {schedule.status === "scheduled" && (
                  <>
                    <DropdownMenuItem onClick={() => onSendReminder(schedule.id)}>
                      <Bell className="h-4 w-4 mr-2" />
                      Kirim Reminder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMarkPosted(schedule.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Tandai Diposting
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(schedule.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
