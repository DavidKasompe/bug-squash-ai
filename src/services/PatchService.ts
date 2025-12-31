import api from "@/lib/api";

export interface Patch {
  id: string;
  bug: string;
  bug_title: string;
  status: 'pending' | 'generated' | 'reviewed' | 'applied' | 'failed' | 'rejected';
  original_file_path: string;
  original_code: string;
  patched_code: string;
  diff: string;
  confidence_score: number;
  review_notes: string;
  applied_at: string | null;
  created_at: string;
}

export const PatchService = {
  async generatePatch(bugId: string): Promise<Patch> {
    const response = await api.post('/patches/generate/', { bug_id: bugId });
    return response.data.patch;
  },

  async getPatches(bugId?: string): Promise<Patch[]> {
    const response = await api.get('/patches/', { params: { bug_id: bugId } });
    return response.data.results || response.data || [];
  },

  async getPatch(patchId: string): Promise<Patch> {
    const response = await api.get(`/patches/${patchId}/`);
    return response.data;
  },

  async applyPatch(patchId: string): Promise<Patch> {
    const response = await api.post(`/patches/${patchId}/apply/`);
    return response.data.patch;
  },

  async reviewPatch(patchId: string, reviewNotes: string): Promise<Patch> {
    const response = await api.post(`/patches/${patchId}/review/`, { review_notes: reviewNotes });
    return response.data.patch;
  },

  async rejectPatch(patchId: string, reviewNotes: string): Promise<Patch> {
    const response = await api.post(`/patches/${patchId}/reject/`, { review_notes: reviewNotes });
    return response.data.patch;
  },
};
