
import {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  authApi,

  uploadResume,
  getResumes,
  getResume,
  deleteResume,
  analyzeResume,
  searchResumes,
  getResumeStats,

  createJob,
  getJobs,
  getJob,
  updateJob,
  updateJobStatus,
  deleteJob,

  createAnalysis,
  getAnalyses,
  getAnalysis,
  getResumeAnalyses,
  getLatestResumeAnalysis,
  getResumeWithLatestAnalysis,
  deleteAnalysis,

  getDashboard,
  getDashboardFallback,
  loadDashboard,

  ApiError,
} from "@/lib/api";

/*
|--------------------------------------------------------------------------
| API SERVICE
|--------------------------------------------------------------------------
|
| This file is only a service/re-export layer.
|
| The actual API implementation lives in:
|
|     src/lib/api.ts
|
| Do NOT:
|
|   - create another API_URL
|   - create another fetch wrapper
|   - read localStorage for tokens
|   - manage access tokens here
|   - duplicate endpoint implementations
|
| Authentication is cookie-based and handled by lib/api.ts.
|
|--------------------------------------------------------------------------
*/

/* ==========================================================================
   GENERIC API
   ========================================================================== */

export {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  ApiError,
};

/* ==========================================================================
   AUTH
   ========================================================================== */

export { authApi };

/* ==========================================================================
   RESUME
   ========================================================================== */

export {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
  analyzeResume,
  searchResumes,
  getResumeStats,
};

/* ==========================================================================
   JOBS
   ========================================================================== */

export {
  createJob,
  getJobs,
  getJob,
  updateJob,
  updateJobStatus,
  deleteJob,
};

/* ==========================================================================
   ANALYSIS
   ========================================================================== */

export {
  createAnalysis,
  getAnalyses,
  getAnalysis,
  getResumeAnalyses,
  getLatestResumeAnalysis,
  getResumeWithLatestAnalysis,
  deleteAnalysis,
};

/* ==========================================================================
   DASHBOARD
   ========================================================================== */

export {
  getDashboard,
  getDashboardFallback,
  loadDashboard,
};

/* ==========================================================================
   SERVICE OBJECTS
   ========================================================================== */

/*
|--------------------------------------------------------------------------
| Auth Service
|--------------------------------------------------------------------------
*/

export const authService = {
  login: authApi.login,
  register: authApi.register,
  me: authApi.me,
  logout: authApi.logout,
};

/*
|--------------------------------------------------------------------------
| Resume Service
|--------------------------------------------------------------------------
*/

export const resumeService = {
  upload: uploadResume,

  getAll: getResumes,

  getById: getResume,

  delete: deleteResume,

  analyze: analyzeResume,

  search: searchResumes,

  stats: getResumeStats,
};

/*
|--------------------------------------------------------------------------
| Job Service
|--------------------------------------------------------------------------
*/

export const jobService = {
  create: createJob,

  getAll: getJobs,

  getById: getJob,

  update: updateJob,

  updateStatus: updateJobStatus,

  delete: deleteJob,
};

/*
|--------------------------------------------------------------------------
| Analysis Service
|--------------------------------------------------------------------------
*/

export const analysisService = {
  create: createAnalysis,

  getAll: getAnalyses,

  getById: getAnalysis,

  getResumeAnalyses,

  getLatest:
    getLatestResumeAnalysis,

  getResumeWithLatest:
    getResumeWithLatestAnalysis,

  delete: deleteAnalysis,
};

/*
|--------------------------------------------------------------------------
| Dashboard Service
|--------------------------------------------------------------------------
*/

export const dashboardService = {
  get: getDashboard,

  fallback:
    getDashboardFallback,

  load: loadDashboard,
};

/*
|--------------------------------------------------------------------------
| DEFAULT API SERVICE
|--------------------------------------------------------------------------
*/

const apiService = {
  auth: authService,

  resumes: resumeService,

  jobs: jobService,

  analysis: analysisService,

  dashboard: dashboardService,
};

export default apiService;

