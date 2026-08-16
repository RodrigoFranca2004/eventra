import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function getTmdbApiKey(): string {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error('TMDB_API_KEY is not configured');
  }

  return apiKey;
}

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
}

interface TmdbMovieResponse {
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  const response = await axios.get<TmdbMovieResponse>(
    `${TMDB_BASE_URL}/search/movie`,
    {
      params: {
        api_key: getTmdbApiKey(),
        query,
        language: 'en-US',
      },
    },
  );

  return response.data.results;
}

export async function getMovieById(id: string): Promise<TmdbMovie> {
  const response = await axios.get<TmdbMovie>(
    `${TMDB_BASE_URL}/movie/${id}`,
    {
      params: {
        api_key: getTmdbApiKey(),
        language: 'en-US',
      },
    },
  );

  return response.data;
}