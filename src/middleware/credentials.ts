import { Request, Response, NextFunction } from "express";
import whitelist from "../configs/whitelist";
const credentials = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin!;
    if (whitelist.includes(origin)) {
        res.header("Access-Control-Allow-Credentials", "true");
    }
    next();
}

export default credentials;