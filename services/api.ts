const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).message ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: string;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(
  email: string,
  password: string,
  role: string,
  firstName?: string,
  lastName?: string
): Promise<RegisterResponse> {
  return request<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, role, firstName, lastName }),
  });
}

export function logout(): Promise<void> {
  return request<void>('/api/auth/logout', {
    method: 'POST',
    headers: authHeaders(),
  });
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface ProfilePayload {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  avatarUrl?: string;
}

export interface ProfileResponse extends ProfilePayload {
  id: string;
  userId: string;
  role: string;
  avatarUrl?: string;
}

export function updateProfile(payload: ProfilePayload): Promise<ProfileResponse> {
  return request<ProfileResponse>('/api/profile', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function getMyProfile(): Promise<ProfileResponse> {
  return request<ProfileResponse>('/api/profile/me', {
    headers: authHeaders(),
  });
}

export interface DesignerStats {
  memberSince: string | null;
  jobsCompleted: number;
  activeContracts: number;
  totalApplications: number;
}

export function getMyStats(): Promise<DesignerStats> {
  return request<DesignerStats>('/api/profile/stats', {
    headers: authHeaders(),
  });
}

// ── Designer Profile ──────────────────────────────────────────────────────────

export interface EducationEntry {
  institution?: string;
  qualification?: string;
  yearCompleted?: number;
}

export interface DesignerProfilePayload {
  headline?: string;
  bio?: string;
  location?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  cvUrl?: string;
  yearsExperience?: number;
  hourlyRate?: number;
  userRating?: number;
  skills?: string[];
  education?: EducationEntry[];
  profileCompleteness?: number;
  displayName?: string;
}

export function getMyDesignerProfile(): Promise<DesignerProfilePayload & { id?: string }> {
  return request('/api/designer-profile/me', {
    headers: authHeaders(),
  });
}

export function updateDesignerProfile(payload: DesignerProfilePayload): Promise<DesignerProfilePayload & { id: string }> {
  return request('/api/designer-profile/me', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

// ── Client Profile ────────────────────────────────────────────────────────────

export interface ClientProfilePayload {
  companyName?: string;
  industry?: string;
  companySize?: string;
  typicalHire?: string;
  location?: string;
  website?: string;
  photoUrl?: string;
}

export function updateClientProfile(payload: ClientProfilePayload): Promise<ClientProfilePayload & { id: string }> {
  return request('/api/client-profile/me', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function getMyClientProfile(): Promise<ClientProfilePayload & { id?: string }> {
  return request('/api/client-profile/me', {
    headers: authHeaders(),
  });
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export type ApiJobType = 'FREELANCE' | 'PERMANENT' | 'CONTRACT';
export type ApiExperienceLevel = 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
export type ApiJobStatus = 'OPEN' | 'CLOSED';
export type ApiApplicationStatus = 'SUBMITTED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
export type ApiPricingModel = 'FIXED' | 'HOURLY';

export interface ApiJob {
  id: string;
  clientId: string;
  clientEmail?: string;
  clientName?: string;
  title: string;
  description: string;
  type: ApiJobType;
  experienceLevel: ApiExperienceLevel;
  budget: string;
  software: string[];
  requirements?: string[];
  postedAt: string;
  status: ApiJobStatus;
  duration?: string;
  location?: string;
  remote?: boolean;
  applicationCount?: number;
  savedByMe?: boolean;
  pricingModel?: ApiPricingModel;
  budgetFixed?: number;
  budgetHourlyMin?: number;
  budgetHourlyMax?: number;
}

export interface ApiJobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  applicantEmail?: string;
  applicantDisplayName?: string;
  coverLetter: string;
  appliedAt: string;
  proposedRate?: number;
  proposedHours?: number;
  proposedAmount?: number;
  deliveryDays?: number;
  status: ApiApplicationStatus;
  cvUrl?: string;
  availability?: string;
  jobTitle?: string;
}

export function listOpenJobs(): Promise<ApiJob[]> {
  return request<ApiJob[]>('/api/jobs/open', { headers: authHeaders() });
}

export function saveJob(id: string): Promise<void> {
  return request<void>(`/api/jobs/${id}/save`, { method: 'POST', headers: authHeaders() });
}

export function unsaveJob(id: string): Promise<void> {
  return request<void>(`/api/jobs/${id}/save`, { method: 'DELETE', headers: authHeaders() });
}

export function postJob(payload: Partial<ApiJob>): Promise<ApiJob> {
  return request<ApiJob>('/api/jobs', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function listMyJobs(): Promise<ApiJob[]> {
  return request<ApiJob[]>('/api/jobs/me', {
    headers: authHeaders(),
  });
}

export function getDesignerProfileByUserId(userId: string): Promise<DesignerProfilePayload> {
  return request<DesignerProfilePayload>(`/api/designer-profile/user/${userId}`, {
    headers: authHeaders(),
  });
}

export function applyToJob(jobId: string, dto: { coverLetter: string; cvUrl?: string; availability?: string }): Promise<ApiJobApplication> {
  return request<ApiJobApplication>(`/api/job-applications/${jobId}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
}

export function listApplicationsForJob(jobId: string): Promise<ApiJobApplication[]> {
  return request<ApiJobApplication[]>(`/api/job-applications/job/${jobId}`, {
    headers: authHeaders(),
  });
}

export function listMyApplications(): Promise<ApiJobApplication[]> {
  return request<ApiJobApplication[]>('/api/job-applications/me', {
    headers: authHeaders(),
  });
}

export function updateApplicationStatus(applicationId: string, status: ApiApplicationStatus): Promise<ApiJobApplication> {
  return request<ApiJobApplication>(`/api/job-applications/${applicationId}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
}

// ── Projects ──────────────────────────────────────────────────────────────────

export type ApiProjectStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ApiMilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED';

export interface ApiMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  amount?: string;
  dueDate?: string;
  sortOrder: number;
  status: ApiMilestoneStatus;
}

export interface ApiProject {
  id: string;
  applicationId: string;
  clientId: string;
  clientEmail: string;
  clientName?: string;
  designerId: string;
  designerEmail: string;
  designerName?: string;
  jobTitle?: string;
  title: string;
  description?: string;
  budget?: string;
  deadline?: string;
  status: ApiProjectStatus;
  createdAt: string;
  completedAt?: string;
  milestones: ApiMilestone[];
}

export interface CreateProjectPayload {
  applicationId: string;
  title: string;
  description?: string;
  budget?: string;
  deadline?: string;
  milestones?: Array<{ title: string; description?: string; amount?: string; dueDate?: string }>;
}

export function createProject(payload: CreateProjectPayload): Promise<ApiProject> {
  return request<ApiProject>('/api/projects', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function listMyProjects(): Promise<ApiProject[]> {
  return request<ApiProject[]>('/api/projects/me', { headers: authHeaders() });
}

export function getProject(id: string): Promise<ApiProject> {
  return request<ApiProject>(`/api/projects/${id}`, { headers: authHeaders() });
}

export function listReadyToStart(): Promise<ApiJobApplication[]> {
  return request<ApiJobApplication[]>('/api/projects/ready-to-start', { headers: authHeaders() });
}

export function updateMilestoneStatus(projectId: string, milestoneId: string, status: ApiMilestoneStatus): Promise<ApiMilestone> {
  return request<ApiMilestone>(`/api/projects/${projectId}/milestones/${milestoneId}?status=${status}`, {
    method: 'PUT',
    headers: authHeaders(),
  });
}

export function completeProject(projectId: string): Promise<ApiProject> {
  return request<ApiProject>(`/api/projects/${projectId}/complete`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

// ── Talent Directory ──────────────────────────────────────────────────────────

export interface TalentCard {
  userId: string;
  displayName?: string;
  email: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  yearsExperience?: number;
  userRating?: number;
  skills?: string[];
}

export function listDesigners(): Promise<TalentCard[]> {
  return request<TalentCard[]>('/api/designer-profile/all', {
    headers: authHeaders(),
  });
}

// ── Images ────────────────────────────────────────────────────────────────────

// Upload an image via multipart. NOTE: we deliberately do NOT set Content-Type —
// the browser must set it to multipart/form-data with the correct boundary.
export function uploadImage(file: File): Promise<{ id: string; url: string }> {
  const form = new FormData();
  form.append('file', file);
  return fetch(`${BASE_URL}/api/images`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as any).message ?? `Upload failed: ${res.status}`);
    }
    return res.json() as Promise<{ id: string; url: string }>;
  });
}

// Resolve a stored image reference to a loadable <img src>.
// Our uploads are stored as relative "/api/images/{id}" so the value is
// host-independent; prefix the API base at render time. Absolute URLs
// (legacy pasted links) pass through untouched.
export function imageSrc(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith('/api/') ? `${BASE_URL}${url}` : url;
}
