import { Router } from 'express';
import { searchCatalog } from './catalog.service.js';

export const catalogRouter = Router();

catalogRouter.get('/movies', async (req, res, next) => {
  try {
    const query = String(req.query.query ?? '').trim();

    if (!query) {
      res.status(400).json({
        message: 'Query parameter is required',
      });
      return;
    }

    const movies = await searchCatalog(query);

    res.status(200).json({
      data: movies,
    });
  } catch (error) {
    next(error);
  }
});