import { Request, Response } from 'express';
import { NodeModel, TriageModel } from '../models';

export const NodeController = {
  getNodes: (req: Request, res: Response) => res.json(NodeModel.getActiveNodes()),
  getTriage: (req: Request, res: Response) => res.json(TriageModel.getCounts()),
};
