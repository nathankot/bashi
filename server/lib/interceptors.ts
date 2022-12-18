import math from "./interceptors/math.ts";
import time from "./interceptors/time.ts";
import translate from "./interceptors/translate.ts";

export const functionCallInterceptors = [math, time, translate];
