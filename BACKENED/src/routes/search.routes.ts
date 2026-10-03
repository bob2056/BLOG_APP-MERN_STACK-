import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { validate } from '../middlewares/validate.middleware';
import { searchQuerySchema } from '../validators/query.validator';

const router = Router();

router.get('/posts', validate(searchQuerySchema, 'query'), SearchController.searchPosts);

export default router;
