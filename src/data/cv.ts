import { existsSync } from 'node:fs';
/** CV is offered for download only when the owner has added public/cv.pdf. */
export const hasCv = existsSync('public/cv.pdf');
