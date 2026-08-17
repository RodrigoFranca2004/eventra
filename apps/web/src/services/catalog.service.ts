import { api } from './api.service';

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
}

export async function searchMovies(
  query: string,
): Promise<TmdbMovie[]> {
  const response = await api<{ data: TmdbMovie[] }>(
    `/catalog/movies?query=${encodeURIComponent(query)}`,
  );

  return response.data;
}