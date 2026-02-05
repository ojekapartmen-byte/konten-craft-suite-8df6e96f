import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, Mail, MessageSquare, Video, FileText, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateScheduledContent, PLATFORMS, Platform } from "@/types/scheduling";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleFormProps {
  onSubmit: (data: CreateScheduledContent) => Promise<unknown>;
  initialData?: Partial<CreateScheduledContent>;
  isEditing?: boolean;
}

export const ScheduleForm = ({ onSubmit, initialData, isEditing }: ScheduleFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateScheduledContent>({
    title: initialData?.title || "",
    platform: initialData?.platform || "instagram",
    scheduled_at: initialData?.scheduled_at || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    caption: initialData?.caption || "",
    hashtags: initialData?.hashtags || [],
    video_url: initialData?.video_url || "",
    thumbnail_url: initialData?.thumbnail_url || "",
    notification_email: initialData?.notification_email ?? true,
    notification_whatsapp: initialData?.notification_whatsapp ?? false,
    whatsapp_number: initialData?.whatsapp_number || "",
    email_address: initialData?.email_address || user?.email || "",
    notes: initialData?.notes || "",
  });

  const [hashtagInput, setHashtagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addHashtag = () => {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.startsWith("#") ? hashtagInput : `#${hashtagInput}`;
      setFormData(prev => ({
        ...prev,
        hashtags: [...(prev.hashtags || []), tag.trim()],
      }));
      setHashtagInput("");
    }
  };

  const removeHashtag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Detail Konten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Konten</Label>
            <Input
              id="title"
              placeholder="Nama konten untuk referensi"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value: Platform) => setFormData(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="flex items-center gap-2">
                        <span>{p.icon}</span>
                        {p.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Jadwal Posting</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  className="pl-10"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">URL Video (opsional)</Label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="video_url"
                placeholder="https://example.com/video.mp4"
                className="pl-10"
                value={formData.video_url}
                onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Tulis caption untuk konten..."
              rows={4}
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Hashtags</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tambah hashtag"
                  className="pl-10"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                />
              </div>
              <Button type="button" variant="secondary" onClick={addHashtag}>
                Tambah
              </Button>
            </div>
            {formData.hashtags && formData.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm cursor-pointer hover:bg-primary/20"
                    onClick={() => removeHashtag(index)}
                  >
                    {tag}
                    <span className="text-xs">×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan..."
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Notifikasi Reminder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Notifikasi Email</p>
                <p className="text-sm text-muted-foreground">Kirim reminder ke email</p>
              </div>
            </div>
            <Switch
              checked={formData.notification_email}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notification_email: checked }))}
            />
          </div>

          {formData.notification_email && (
            <div className="space-y-2 pl-8">
              <Label htmlFor="email_address">Email Address</Label>
              <Input
                id="email_address"
                type="email"
                placeholder="email@example.com"
                value={formData.email_address}
                onChange={(e) => setFormData(prev => ({ ...prev, email_address: e.target.value }))}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Notifikasi WhatsApp</p>
                <p className="text-sm text-muted-foreground">Kirim reminder via WhatsApp</p>
              </div>
            </div>
            <Switch
              checked={formData.notification_whatsapp}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notification_whatsapp: checked }))}
            />
          </div>

          {formData.notification_whatsapp && (
            <div className="space-y-2 pl-8">
              <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
              <Input
                id="whatsapp_number"
                placeholder="+6281234567890"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Format: +62 diikuti nomor (tanpa 0)</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : isEditing ? "Perbarui Jadwal" : "Buat Jadwal"}
      </Button>
    </form>
  );
};
