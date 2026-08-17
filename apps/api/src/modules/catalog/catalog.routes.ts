import { Router } from 'express';
import { searchCatalog } from './catalog.service.js';
import { movieSearchSchema } from './catalog.schemas.js';

export const catalogRouter = Router();

catalogRouter.get('/movies', async (req, res, next) => {
  try {
    const result = movieSearchSchema.safeParse({
      query: req.query.query,
    });

    if (!result.success) {
      res.status(400).json({
        message: 'Invalid request data',
        errors: result.error.issues,
      });
      return;
    }

    const movies = await searchCatalog(result.data.query);

    res.status(200).json({
      data: movies,
    });
  } catch (error) {
    next(error);
  }
});