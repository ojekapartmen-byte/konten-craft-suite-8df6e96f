import { useState } from "react";
import { format, isToday, isTomorrow, isThisWeek, startOfDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScheduleCard } from "./ScheduleCard";
import { ScheduledContent, PLATFORMS, Platform } from "@/types/scheduling";

interface ScheduleListProps {
  schedules: ScheduledContent[];
  isLoading: boolean;
  onMarkPosted: (id: string) => void;
  onSendReminder: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ScheduleList = ({
  schedules,
  isLoading,
  onMarkPosted,
  onSendReminder,
  onDelete,
}: ScheduleListProps) => {
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusTab, setStatusTab] = useState("upcoming");

  const filteredSchedules = schedules.filter((s) => {
    const matchesPlatform = platformFilter === "all" || s.platform === platformFilter;
    const scheduledDate = new Date(s.scheduled_at);
    const now = new Date();

    switch (statusTab) {
      case "upcoming":
        return matchesPlatform && s.status === "scheduled" && scheduledDate >= startOfDay(now);
      case "overdue":
        return matchesPlatform && s.status === "scheduled" && scheduledDate < startOfDay(now);
      case "posted":
        return matchesPlatform && s.status === "posted";
      case "all":
      default:
        return matchesPlatform;
    }
  });

  const groupByDate = (items: ScheduledContent[]) => {
    const groups: Record<string, ScheduledContent[]> = {};
    items.forEach((item) => {
      const date = startOfDay(new Date(item.scheduled_at)).toISOString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  };

  const getDateGroupLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Hari Ini";
    if (isTomorrow(date)) return "Besok";
    if (isThisWeek(date)) return format(date, "EEEE", { locale: localeId });
    return format(date, "dd MMMM yyyy", { locale: localeId });
  };

  const grouped = groupByDate(filteredSchedules);
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const upcomingCount = schedules.filter(
    (s) => s.status === "scheduled" && new Date(s.scheduled_at) >= startOfDay(new Date())
  ).length;

  const overdueCount = schedules.filter(
    (s) => s.status === "scheduled" && new Date(s.scheduled_at) < startOfDay(new Date())
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={statusTab} onValueChange={setStatusTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="upcoming" className="relative">
              Akan Datang
              {upcomingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {upcomingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="overdue" className="relative">
              Terlewat
              {overdueCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                  {overdueCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="posted">Sudah Diposting</TabsTrigger>
            <TabsTrigger value="all">Semua</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v as Platform | "all")}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Platform</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                <span className="flex items-center gap-2">
                  {p.icon} {p.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Tidak ada jadwal konten</p>
          <p className="text-sm">Buat jadwal baru untuk memulai</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => (
            <div key={dateStr}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {getDateGroupLabel(dateStr)}
              </h3>
              <div className="space-y-3">
                {grouped[dateStr].map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onMarkPosted={onMarkPosted}
                    onSendReminder={onSendReminder}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
