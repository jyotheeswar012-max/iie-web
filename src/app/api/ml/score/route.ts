/**
 * /api/ml/score  — canonical URL referenced in JUDGES.md
 *
 * This is a thin re-export of /api/ml/predict.
 * Both URLs are identical in behaviour; /api/ml/score is the
 * judge-facing endpoint, /api/ml/predict is the legacy alias.
 */
export { GET, POST, OPTIONS, runtime } from '../predict/route';
