import { useCallback, useEffect, useState } from 'react';
import client, { message } from '../api/client';

export function useResource(url) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const load = useCallback(async () => {
    setState((old) => ({ ...old, loading: true, error: '' }));
    try {
      const { data } = await client.get(url);
      setState({ data, loading: false, error: '' });
    } catch (error) {
      setState({ data: null, loading: false, error: message(error) });
    }
  }, [url]);
  useEffect(() => {
    load();
  }, [load]);
  return { ...state, reload: load };
}
