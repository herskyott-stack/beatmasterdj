import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarLesson = {
  id: string;
  lesson_number: number;
  title: string;
  hasVideo: boolean;
};
export type SidebarModule = {
  id: string;
  module_number: number;
  title: string;
  lessons: SidebarLesson[];
};

type Props = {
  modules: SidebarModule[];
  activeLessonId?: string;
  onPick: (moduleId: string, lessonId: string) => void;
};

const RecordSidebar = ({ modules, activeLessonId, onPick }: Props) => {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // Auto-open the module containing the active lesson
  useEffect(() => {
    if (!activeLessonId) return;
    const m = modules.find((mod) => mod.lessons.some((l) => l.id === activeLessonId));
    if (m) setOpen((s) => ({ ...s, [m.id]: true }));
  }, [activeLessonId, modules]);

  return (
    <nav className="space-y-1">
      {modules.map((m) => {
        const isOpen = open[m.id] ?? false;
        const done = m.lessons.filter((l) => l.hasVideo).length;
        return (
          <div key={m.id} className="rounded-md border border-white/10 bg-card/40">
            <button
              type="button"
              onClick={() => setOpen((s) => ({ ...s, [m.id]: !isOpen }))}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-primary/5 transition rounded-md"
            >
              <span className="flex items-center gap-2 min-w-0">
                {isOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                <span className="text-sm font-semibold truncate">
                  M{m.module_number}. {m.title}
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {done}/{m.lessons.length}
              </span>
            </button>
            {isOpen && (
              <ul className="pb-2">
                {m.lessons.map((l) => {
                  const active = l.id === activeLessonId;
                  return (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => onPick(m.id, l.id)}
                        className={cn(
                          "w-full flex items-center gap-2 pl-9 pr-3 py-1.5 text-left text-xs hover:bg-primary/10 transition",
                          active && "bg-primary/15 text-primary font-medium"
                        )}
                      >
                        {l.hasVideo ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate">
                          {l.lesson_number}. {l.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default RecordSidebar;
