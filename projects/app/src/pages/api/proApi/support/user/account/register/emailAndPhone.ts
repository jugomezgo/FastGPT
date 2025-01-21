import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from "@/service/middleware/entry";
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    return {
        "code": 200,
        "statusText": "",
        "message": "",
        "data": null
    }
}

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);