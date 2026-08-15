"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  analyzeResume,
  deleteResume,
  getResume,
  getResumes,
  getResumeStats,
  searchResumes,
  uploadResume,
  type Resume,
  type ResumeStats,
} from "@/lib/api";

interface UseResumesReturn {
  resumes: Resume[];
  stats: ResumeStats | null;

  loading: boolean;
  uploading: boolean;
  analyzing: boolean;
  deleting: boolean;

  error: string | null;

  fetchResumes: () => Promise<void>;

  upload: (
    file: File
  ) => Promise<Resume | null>;

  getById: (
    id: string
  ) => Promise<Resume | null>;

  analyze: (
    id: string
  ) => Promise<Resume | null>;

  remove: (
    id: string
  ) => Promise<boolean>;

  search: (
    keyword: string
  ) => Promise<Resume[]>;

  fetchStats: () => Promise<void>;

  clearError: () => void;
}

export function useResumes(): UseResumesReturn {
  const [resumes, setResumes] =
    useState<Resume[]>([]);

  const [stats, setStats] =
    useState<ResumeStats | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /**
   * ============================================================
   * CLEAR ERROR
   * ============================================================
   */

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  /**
   * ============================================================
   * GET ALL RESUMES
   * ============================================================
   */

  const fetchResumes =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getResumes();

        setResumes(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch resumes.";

        console.error(
          "[RESUME] Fetch error:",
          error
        );

        setError(message);
      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * ============================================================
   * UPLOAD RESUME
   * ============================================================
   */

  const upload =
    useCallback(
      async (
        file: File
      ): Promise<Resume | null> => {
        try {
          setUploading(true);
          setError(null);

          const resume =
            (await uploadResume(
              file
            )) as Resume;

          setResumes(
            (current) => [
              resume,
              ...current,
            ]
          );

          return resume;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to upload resume.";

          console.error(
            "[RESUME] Upload error:",
            error
          );

          setError(message);

          return null;
        } finally {
          setUploading(false);
        }
      },
      []
    );

  /**
   * ============================================================
   * GET RESUME BY ID
   * ============================================================
   */

  const getById =
    useCallback(
      async (
        id: string
      ): Promise<Resume | null> => {
        try {
          setError(null);

          const resume =
            (await getResume(
              id
            )) as Resume;

          return resume;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch resume.";

          console.error(
            "[RESUME] Get resume error:",
            error
          );

          setError(message);

          return null;
        }
      },
      []
    );

  /**
   * ============================================================
   * RE-ANALYZE RESUME
   * ============================================================
   */

  const analyze =
    useCallback(
      async (
        id: string
      ): Promise<Resume | null> => {
        try {
          setAnalyzing(true);
          setError(null);

          const updated =
            (await analyzeResume(
              id
            )) as Resume;

          setResumes(
            (current) =>
              current.map(
                (resume) =>
                  resume.id === id
                    ? updated
                    : resume
              )
          );

          return updated;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to analyze resume.";

          console.error(
            "[RESUME] Analysis error:",
            error
          );

          setError(message);

          return null;
        } finally {
          setAnalyzing(false);
        }
      },
      []
    );

  /**
   * ============================================================
   * DELETE RESUME
   * ============================================================
   */

  const remove =
    useCallback(
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setDeleting(true);
          setError(null);

          await deleteResume(
            id
          );

          setResumes(
            (current) =>
              current.filter(
                (resume) =>
                  resume.id !== id
              )
          );

          return true;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to delete resume.";

          console.error(
            "[RESUME] Delete error:",
            error
          );

          setError(message);

          return false;
        } finally {
          setDeleting(false);
        }
      },
      []
    );

  /**
   * ============================================================
   * SEARCH RESUMES
   * ============================================================
   */

  const search =
    useCallback(
      async (
        keyword: string
      ): Promise<Resume[]> => {
        try {
          setError(null);

          const results =
            await searchResumes(
              keyword
            );

          setResumes(
            results
          );

          return results;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to search resumes.";

          console.error(
            "[RESUME] Search error:",
            error
          );

          setError(message);

          return [];
        }
      },
      []
    );

  /**
   * ============================================================
   * GET RESUME STATISTICS
   * ============================================================
   */

  const fetchStats =
    useCallback(async () => {
      try {
        setError(null);

        const data =
          await getResumeStats();

        setStats(
          data as ResumeStats
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch resume statistics.";

        console.error(
          "[RESUME] Stats error:",
          error
        );

        setError(message);
      }
    }, []);

  /**
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    fetchResumes();
    fetchStats();
  }, [
    fetchResumes,
    fetchStats,
  ]);

  /**
   * ============================================================
   * RETURN
   * ============================================================
   */

  return {
    resumes,
    stats,

    loading,
    uploading,
    analyzing,
    deleting,

    error,

    fetchResumes,

    upload,
    getById,
    analyze,
    remove,

    search,

    fetchStats,

    clearError,
  };
}