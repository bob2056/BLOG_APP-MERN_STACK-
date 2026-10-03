import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { sendPaginated } from '../utils/apiResponse';

export class SearchController {
  static async searchPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = (req.query.q as string) || '';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await SearchService.searchPosts(q, { page, limit });
      sendPaginated(res, result.posts, result.pagination, `Search results for '${q}'`);
    } catch (error) {
      next(error);
    }
  }
}
