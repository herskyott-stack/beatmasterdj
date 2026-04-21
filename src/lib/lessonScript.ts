// Build a spoken teleprompter script from a lesson's markdown notes.
// Pure function — no I/O.

export type ScriptLesson = {
  lesson_number: number;
  title: string;
  description: string | null;
  additional_notes: string | null;
};

export type ScriptModule = {
  module_number: number;
  title: string;
};

const stripInline = (s: string) =>
  s
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .trim();

const ordinals = [
  "First", "Second", "Third", "Fourth", "Fifth",
  "Sixth", "Seventh", "Eighth", "Ninth", "Tenth",
];

function notesToSpoken(notes: string): string {
  // Trim a trailing "Sources" / "References" section
  const cleaned = notes.replace(/\n#+\s*(sources|references|further reading)[\s\S]*$/i, "");

  const lines = cleaned.split(/\r?\n/);
  const out: string[] = [];
  let bulletIdx = 0;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      bulletIdx = 0;
      out.push("");
      continue;
    }

    // Headings → section pause
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const text = stripInline(h[2]);
      if (text) out.push(`\nLet's talk about ${text}.\n`);
      bulletIdx = 0;
      continue;
    }

    // Bullets / numbered
    const b = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.*)$/);
    if (b) {
      const text = stripInline(b[1]);
      if (!text) continue;
      const prefix = bulletIdx < ordinals.length ? ordinals[bulletIdx] : `Next`;
      out.push(`${prefix}, ${text}.`);
      bulletIdx++;
      continue;
    }

    // Block quote
    const q = line.match(/^\s*>\s?(.*)$/);
    if (q) {
      out.push(stripInline(q[1]));
      continue;
    }

    // Skip code fences
    if (/^\s*```/.test(line)) continue;

    bulletIdx = 0;
    const text = stripInline(line);
    if (text) out.push(text);
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildScript(lesson: ScriptLesson, module: ScriptModule, totalLessonsInModule?: number): string {
  const intro =
    `[INTRO]\n` +
    `Welcome back to the Hersky DJ Mentorship. I'm Hersky, and in this lesson — ` +
    `Module ${module.module_number}, Lesson ${lesson.lesson_number}: ${lesson.title} — ` +
    (lesson.description?.trim()
      ? `we're going to cover ${stripInline(lesson.description.trim())}.`
      : `we're diving straight in.`);

  const notes = (lesson.additional_notes || "").trim();
  const body = notes
    ? `\n\n[MAIN CONTENT]\n${notesToSpoken(notes)}`
    : `\n\n[MAIN CONTENT]\n(No detailed notes yet — improvise around the title: "${lesson.title}". ` +
      `Consider adding notes in the curriculum editor for a richer script.)`;

  const isLast = totalLessonsInModule != null && lesson.lesson_number >= totalLessonsInModule;
  const outro =
    `\n\n[OUTRO]\n` +
    `That wraps up this lesson. Hit the quiz below to lock it in, ` +
    (isLast
      ? `and I'll see you in the next module.`
      : `and I'll see you in Lesson ${lesson.lesson_number + 1}.`);

  return intro + body + outro;
}

export const hasThinNotes = (notes: string | null) => !notes || notes.trim().length < 120;
