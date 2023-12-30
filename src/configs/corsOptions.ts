import { Request, Response, NextFunction } from "express";
import whitelist from "./whitelist";


const corsOptions = {
    origin: function (origin: any, callback: any) {
        if (whitelist.includes(origin) || !origin) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    optionsSuccessStatus: 200,
}

export default corsOptions;