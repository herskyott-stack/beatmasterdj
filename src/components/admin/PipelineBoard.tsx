import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, GripVertical, MapPin } from "lucide-react";
import { PIPELINE_STAGES, stageAccentClass, type PipelineStage } from "@/lib/pipeline";
import { money, statusBadgeClass } from "@/lib/payments";

export type PipelineClient = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  event_date: string | null;
  event_location: string | null;
  event_type: string | null;
  payment_status: string;
  full_amount: number;
  amount_paid: number;
  pipeline_stage: string;
};

interface Props {
  clients: PipelineClient[];
  canEdit: boolean;
  onStageChange: (clientId: string, stage: PipelineStage) => void;
  onOpenClient?: (clientId: string) => void;
}

const PipelineBoard = ({ clients, canEdit, onStageChange, onOpenClient }: Props) => {
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<string | null>(null);

  const handleDrop = (stage: PipelineStage) => {
    if (!canEdit || !dragging) return;
    const client = clients.find((c) => c.id === dragging);
    if (client && client.pipeline_stage !== stage) onStageChange(dragging, stage);
    setDragging(null);
    setHoverStage(null);
  };

  return (
    <div className="space-y-4">
      {!canEdit && (
        <p className="text-xs text-muted-foreground">
          View-only access — ask an owner to move clients between stages.
        </p>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        {PIPELINE_STAGES.map((stage) => {
          const column = clients.filter((c) => c.pipeline_stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                if (!canEdit) return;
                e.preventDefault();
                setHoverStage(stage);
              }}
              onDragLeave={() => setHoverStage((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(stage);
              }}
              className={`w-[260px] shrink-0 rounded-md border bg-card/40 backdrop-blur-2xl p-3 transition-colors ${
                hoverStage === stage && canEdit ? "border-primary/60 bg-primary/5" : "border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className={stageAccentClass(stage)}>
                  {stage}
                </Badge>
                <span className="text-xs text-muted-foreground">{column.length}</span>
              </div>

              <div className="space-y-3 min-h-[80px]">
                {column.length === 0 && (
                  <p className="text-xs text-muted-foreground/60 py-6 text-center">
                    Drop clients here
                  </p>
                )}
                {column.map((c) => (
                  <Card
                    key={c.id}
                    variant="glass"
                    draggable={canEdit}
                    onDragStart={() => setDragging(c.id)}
                    onDragEnd={() => {
                      setDragging(null);
                      setHoverStage(null);
                    }}
                    onClick={() => onOpenClient?.(c.id)}
                    className={`cursor-pointer transition-opacity ${
                      dragging === c.id ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        {canEdit && (
                          <GripVertical className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {c.first_name} {c.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                        </div>
                      </div>

                      {c.event_date && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.event_date).toLocaleDateString("en-CA")}
                          {c.event_type ? ` · ${c.event_type}` : ""}
                        </p>
                      )}
                      {c.event_location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{c.event_location}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${statusBadgeClass(c.payment_status)}`}
                        >
                          {c.payment_status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {money(Number(c.amount_paid) || 0)} / {money(Number(c.full_amount) || 0)}
                        </span>
                      </div>

                      {canEdit && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={c.pipeline_stage}
                            onValueChange={(v) => onStageChange(c.id, v as PipelineStage)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PIPELINE_STAGES.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineBoard;
