import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from "@/service/middleware/entry";
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getGroupsByTmbId } from '@fastgpt/service/support/permission/memberGroup/controllers';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { tmbId, teamId } = await authCert({ req, authToken: true });
    return getGroupsByTmbId({ tmbId, teamId });
}

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);