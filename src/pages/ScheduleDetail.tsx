import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Download,
  Bell,
  CheckCircle,
  Trash2,
  ExternalLink,
  Mail,
  MessageCircle,
  Save,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useScheduledContent } from "@/hooks/useScheduledContent";
import { useToast } from "@/hooks/use-toast";
import { PLATFORMS } from "@/types/scheduling";
import { EditableField } from "@/components/scheduling/EditableField";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ScheduleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { schedules, updateSchedule, markAsPosted, sendReminder, deleteSchedule } =
    useScheduledContent();

  const schedule = schedules.find((s) => s.id === id);

  // Editable local state
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editHashtags, setEditHashtags] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync from schedule to local state
  useEffect(() => {
    if (schedule) {
      setEditTitle(schedule.title);
      setEditCaption(schedule.caption || "");
      setEditNotes(schedule.notes || "");
      setEditHashtags(schedule.hashtags?.join(" ") || "");
    }
  }, [schedule]);

  // Detect unsaved changes
  const hasChanges = useMemo(() => {
    if (!schedule) return false;
    return (
      editTitle !== schedule.title ||
      editCaption !== (schedule.caption || "") ||
      editNotes !== (schedule.notes || "") ||
      editHashtags !== (schedule.hashtags?.join(" ") || "")
    );
  }, [schedule, editTitle, editCaption, editNotes, editHashtags]);

  if (!schedule) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground mb-4">Jadwal tidak ditemukan</p>
          <Button onClick={() => navigate("/scheduling")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Jadwal
          </Button>
        </div>
      </MainLayout>
    );
  }

  const platform = PLATFORMS.find((p) => p.value === schedule.platform);
  const scheduledDate = new Date(schedule.scheduled_at);
  const isOverdue = isPast(scheduledDate) && schedule.status === "scheduled";

  const getDateLabel = () => {
    if (isToday(scheduledDate)) return "Hari ini";
    if (isTomorrow(scheduledDate)) return "Besok";
    return format(scheduledDate, "EEEE, dd MMMM yyyy", { locale: localeId });
  };

  const getStatusBadge = () => {
    switch (schedule.status) {
      case "posted":
        return <Badge className="bg-green-500">Sudah Diposting</Badge>;
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

  const handleSave = async () => {
    setIsSaving(true);
    const hashtagsArray = editHashtags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    const success = await updateSchedule(schedule.id, {
      title: editTitle,
      caption: editCaption || undefined,
      notes: editNotes || undefined,
      hashtags: hashtagsArray.length > 0 ? hashtagsArray : undefined,
    });

    setIsSaving(false);
    if (success) {
      toast({ title: "Perubahan berhasil disimpan! ✅" });
    }
  };

  const copyCaption = () => {
    const fullCaption = editHashtags
      ? `${editCaption}\n\n${editHashtags}`
      : editCaption;
    if (fullCaption) {
      navigator.clipboard.writeText(fullCaption);
      toast({ title: "Caption disalin ke clipboard!" });
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

  const handleMarkPosted = async () => {
    await markAsPosted(schedule.id);
    toast({ title: "Jadwal ditandai sebagai sudah diposting!" });
  };

  const handleSendReminder = async () => {
    await sendReminder(schedule.id);
  };

  const handleDelete = async () => {
    await deleteSchedule(schedule.id);
    navigate("/scheduling");
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/scheduling")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button onClick={handleSave} disabled={isSaving} className="animate-pulse">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Jadwal akan dihapus secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Title Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{platform?.icon}</span>
                    <div className="flex-1">
                      <EditableField
                        value={editTitle}
                        onChange={setEditTitle}
                        placeholder="Judul konten..."
                        displayClassName="text-xl font-semibold"
                      />
                      <p className="text-sm text-muted-foreground mt-1">{platform?.label}</p>
                    </div>
                  </div>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {getDateLabel()}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(scheduledDate, "HH:mm")} WIB
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Media Preview */}
            {(schedule.image_url || schedule.video_url || schedule.thumbnail_url) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(schedule.image_url || schedule.thumbnail_url) && (
                    <div className="rounded-lg overflow-hidden bg-muted aspect-video">
                      <img
                        src={schedule.image_url || schedule.thumbnail_url!}
                        alt={schedule.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {schedule.video_url && (
                    <div className="flex gap-2">
                      <Button onClick={downloadVideo} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(schedule.video_url!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Buka
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Caption - Always shown, editable */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Caption</CardTitle>
                <Button variant="ghost" size="sm" onClick={copyCaption}>
                  <Copy className="h-4 w-4 mr-2" />
                  Salin
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <EditableField
                  value={editCaption}
                  onChange={setEditCaption}
                  multiline
                  placeholder="Tulis caption di sini..."
                  displayClassName="whitespace-pre-wrap text-sm"
                />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Hashtags</p>
                  <EditableField
                    value={editHashtags}
                    onChange={setEditHashtags}
                    placeholder="#hashtag1 #hashtag2 ..."
                    displayClassName="text-sm text-primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes - Always shown, editable */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Catatan</CardTitle>
              </CardHeader>
              <CardContent>
                <EditableField
                  value={editNotes}
                  onChange={setEditNotes}
                  multiline
                  placeholder="Tambah catatan..."
                  displayClassName="text-sm text-muted-foreground whitespace-pre-wrap"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Save Button (mobile-friendly) */}
            {hasChanges && (
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Ada perubahan yang belum disimpan
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            {schedule.status === "scheduled" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleSendReminder} variant="outline" className="w-full">
                    <Bell className="h-4 w-4 mr-2" />
                    Kirim Reminder Sekarang
                  </Button>
                  <Button onClick={handleMarkPosted} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Tandai Sudah Diposting
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pengaturan Notifikasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </span>
                  <Badge variant={schedule.notification_email ? "default" : "outline"}>
                    {schedule.notification_email ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                {schedule.notification_email && schedule.email_address && (
                  <p className="text-xs text-muted-foreground pl-6">{schedule.email_address}</p>
                )}
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </span>
                  <Badge variant={schedule.notification_whatsapp ? "default" : "outline"}>
                    {schedule.notification_whatsapp ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                {schedule.notification_whatsapp && schedule.whatsapp_number && (
                  <p className="text-xs text-muted-foreground pl-6">{schedule.whatsapp_number}</p>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dibuat</span>
                  <span>{format(new Date(schedule.created_at), "dd MMM yyyy, HH:mm")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diperbarui</span>
                  <span>{format(new Date(schedule.updated_at), "dd MMM yyyy, HH:mm")}</span>
                </div>
                {schedule.reminder_sent_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reminder Terkirim</span>
                    <span>
                      {format(new Date(schedule.reminder_sent_at), "dd MMM yyyy, HH:mm")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ScheduleDetail;
