import { searchMovies } from './tmdb.service.js';

export async function searchCatalog(query: string) {
  return searchMovies(query);
}