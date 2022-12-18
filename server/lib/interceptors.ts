import { OutputInterceptor } from "./interceptors/type.ts";

import math from "./interceptors/math.ts";
import time from "./interceptors/time.ts";

export const interceptors: OutputInterceptor[] = [math, time];

export default interceptors;
