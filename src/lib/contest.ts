// Contest configuration — single source of truth
export const CONTEST = {
  id: "summer-tech-dj-2026",
  name: "Summer DJ Giveaway",
  endDate: new Date("2026-09-01T23:59:59-04:00"),
  prize: "a free custom DJ add-on for your booked DJ package",
};

export const isContestActive = () => new Date() < CONTEST.endDate;
