import { Request } from "express";
import { UserDocument } from "../models/user";

export interface AuthenticatedRequest<
  Body = any,
  Params = any,
  Query = Record<string, any>,
> extends Request<Params, any, Body, Query> {
  user?: UserDocument;
}
