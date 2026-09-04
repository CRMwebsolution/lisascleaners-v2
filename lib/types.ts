export type StaffRole = "admin" | "staff";

export type RequestStatus = "new" | "contacted" | "booked" | "declined";

export type JobStatus = "scheduled" | "completed" | "cancelled";

export interface LisaProfile {
  id: string;
  business_id: string;
  full_name: string;
  role: StaffRole;
  email?: string | null;
  created_at?: string;
}

export interface QuoteRequest {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  job_address: string;
  type_of_clean: string;
  preferred_date: string | null;
  quote_time: string | null;
  cleaning_schedule: string | null;
  cleaning_time: string | null;
  notes: string | null;
  consent_at: string | null;
  status: RequestStatus;
  decline_reason?: string | null;
  created_at: string;
}

export interface LisaJob {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  address: string;
  type_of_clean: string;
  price: number | null;
  job_date: string;
  job_time: string | null;
  status: JobStatus;
  notes: string | null;
  source_request_id?: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface JobAssignment {
  id: string;
  job_id: string;
  assignee_id: string;
  employee_notes: string | null;
  marked_complete_at: string | null;
  business_id: string;
  profile?: LisaProfile | null;
}

export interface JobWithAssignments extends LisaJob {
  job_assignments: JobAssignment[];
}
