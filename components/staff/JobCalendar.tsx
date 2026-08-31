"use client";

import { useMemo } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { getServiceColor, SERVICE_LEGEND } from "@/lib/calendarColors";
import type { JobWithAssignments } from "@/lib/types";

export type CalView = "month" | "week" | "day";

function parseJobDate(value: string | null | undefined) {
  if (!value) return null;
  const iso = parseISO(String(value).slice(0, 10));
  if (!Number.isNaN(iso.getTime())) return iso;
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function jobDateTime(job: JobWithAssignments) {
  const date = String(job.job_date ?? "").slice(0, 10);
  const time = job.job_time ? String(job.job_time).slice(0, 8) : "00:00:00";
  const parsed = parseISO(`${date}T${time}`);
  return Number.isNaN(parsed.getTime()) ? parseJobDate(date) : parsed;
}

function jobsOnDay(jobs: JobWithAssignments[], day: Date) {
  return jobs
    .filter((job) => {
      const date = parseJobDate(job.job_date);
      return date ? isSameDay(date, day) : false;
    })
    .sort((a, b) => String(a.job_time ?? "").localeCompare(String(b.job_time ?? "")));
}

function JobChip({ job, onClick }: { job: JobWithAssignments; onClick: () => void }) {
  const when = jobDateTime(job);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full truncate rounded border px-1.5 py-0.5 text-left text-xs font-medium hover:opacity-80 ${getServiceColor(job.type_of_clean)}`}
    >
      {when ? format(when, "h:mma") : ""} {job.customer_name}
    </button>
  );
}

export default function JobCalendar({
  jobs,
  calDate,
  calView,
  onView,
  onDate,
  onJobClick,
}: {
  jobs: JobWithAssignments[];
  calDate: Date;
  calView: CalView;
  onView: (view: CalView) => void;
  onDate: (date: Date) => void;
  onJobClick: (job: JobWithAssignments) => void;
}) {
  const title =
    calView === "month"
      ? format(calDate, "MMMM yyyy")
      : calView === "week"
        ? `Week of ${format(startOfWeek(calDate), "MMM d, yyyy")}`
        : format(calDate, "EEEE, MMMM d, yyyy");

  function shift(dir: -1 | 1) {
    if (calView === "month") onDate(dir === 1 ? addMonths(calDate, 1) : subMonths(calDate, 1));
    else if (calView === "week") onDate(dir === 1 ? addWeeks(calDate, 1) : subWeeks(calDate, 1));
    else onDate(dir === 1 ? addDays(calDate, 1) : subDays(calDate, 1));
  }

  const days = useMemo(() => {
    if (calView === "day") return [calDate];
    if (calView === "week") return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(calDate), i));
    return Array.from({ length: 42 }, (_, i) => addDays(startOfWeek(startOfMonth(calDate)), i));
  }, [calDate, calView]);

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-purple-dark">{title}</h1>
        <button type="button" className="tap rounded-md bg-white px-3 text-sm" onClick={() => shift(-1)}>Prev</button>
        <button type="button" className="tap rounded-md bg-white px-3 text-sm" onClick={() => shift(1)}>Next</button>
        {(["month", "week", "day"] as CalView[]).map((view) => (
          <button key={view} type="button" onClick={() => onView(view)} className={`tap rounded-md px-3 text-sm capitalize ${calView === view ? "bg-purple-mid text-white" : "bg-white"}`}>{view}</button>
        ))}
      </div>
      <p className="mt-2 text-sm text-purple-mid">{jobs.length} job{jobs.length === 1 ? "" : "s"} loaded</p>
      <div className="mt-4 flex overflow-hidden rounded-xl border border-purple-light bg-white">
        <div className="min-w-0 flex-1">
          {calView !== "day" ? (
            <>
              <div className="grid grid-cols-7 border-b border-gray-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, index) => (
                  <div key={label} className="py-2 text-center text-xs font-semibold uppercase text-gray-500">
                    {calView === "week" ? format(days[index], "EEE d") : label}
                  </div>
                ))}
              </div>
              <div className={`grid grid-cols-7 ${calView === "week" ? "min-h-[400px]" : ""}`}>
                {days.map((day) => {
                  const dayJobs = jobsOnDay(jobs, day);
                  const outside = calView === "month" && !isSameMonth(day, calDate);
                  return (
                    <div key={day.toISOString()} className={`min-h-24 border-b border-r border-gray-100 p-1.5 ${outside ? "bg-gray-50" : ""}`}>
                      <button type="button" onClick={() => onDate(day)} className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm ${isSameDay(day, new Date()) ? "bg-purple-mid font-semibold text-white" : outside ? "text-gray-400" : "text-gray-900"}`}>
                        {format(day, "d")}
                      </button>
                      <div className="space-y-0.5">
                        {(calView === "month" ? dayJobs.slice(0, 3) : dayJobs).map((job) => (
                          <JobChip key={job.id} job={job} onClick={() => onJobClick(job)} />
                        ))}
                        {calView === "month" && dayJobs.length > 3 ? <p className="pl-1 text-xs text-gray-500">+{dayJobs.length - 3} more</p> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-2 p-4">
              {jobsOnDay(jobs, calDate).length === 0 ? <p className="py-12 text-center text-gray-400">No jobs scheduled</p> : null}
              {jobsOnDay(jobs, calDate).map((job) => {
                const when = jobDateTime(job);
                return (
                  <button key={job.id} type="button" onClick={() => onJobClick(job)} className={`w-full rounded-xl border-2 p-4 text-left hover:shadow-md ${getServiceColor(job.type_of_clean)}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{job.customer_name}</p>
                        <p className="mt-0.5 text-sm opacity-80">{job.address}</p>
                        <p className="mt-0.5 text-sm opacity-70">{job.type_of_clean}</p>
                      </div>
                      <span className="whitespace-nowrap text-sm font-medium">{when ? format(when, "h:mm a") : ""}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <aside className="hidden w-44 flex-shrink-0 overflow-y-auto border-l border-gray-200 p-4 text-xs sm:block">
          {SERVICE_LEGEND.map((item) => (
            <div key={item.name} className="mb-3 flex items-center gap-2.5">
              <div className={`h-4 w-4 rounded-full border ${item.colorClass}`} />
              <span className="font-medium text-gray-700">{item.name}</span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
