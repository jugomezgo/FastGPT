import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from "@/service/middleware/entry";
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  return {
    "code":200,
    "statusText":"",
    "message":"",
    "data":{
        "captchaImage":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    }
  }
}

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);