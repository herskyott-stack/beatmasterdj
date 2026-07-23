// Contest configuration — single source of truth
export const CONTEST = {
  id: "summer-tech-dj-2026",
  name: "Summer Tech & DJ Giveaway",
  endDate: new Date("2026-09-01T23:59:59-04:00"),
  prize: "a free tech support session OR a custom DJ mix",
};

export const isContestActive = () => new Date() < CONTEST.endDate;
