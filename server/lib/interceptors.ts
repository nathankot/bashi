import { OutputInterceptor } from "./interceptors/type.ts";

import math from "./interceptors/math.ts";
import time from "./interceptors/time.ts";
import translate from "./interceptors/translate.ts";

export const interceptors: OutputInterceptor[] = [math, time, translate];

export default interceptors;
