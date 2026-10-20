import { create } from 'zustand';
import client, { loadCsrf, refresh, message } from '../api/client';

export const useAuth = create((set) => ({
  user: null,
  initialized: false,
  error: '',
  async initialize() {
    set({ initialized: false, error: '' });
    try {
      await loadCsrf();
      try {
        const { data } = await refresh();
        set({ user: data });
      } catch (error) {
        if (error.response?.status !== 401) throw error;
        set({ user: null });
      }
    } catch (error) {
      set({ error: message(error) });
    } finally {
      set({ initialized: true });
    }
  },
  async login(body) {
    await loadCsrf();
    const { data } = await client.post('/auth/login', body);
    set({ user: data });
    return data;
  },
  async logout() {
    await client.post('/auth/logout');
    set({ user: null });
  },
  setUser(user) {
    set({ user });
  },
}));
