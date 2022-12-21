import math from "./interceptors/math.ts";
import time from "./interceptors/time.ts";
import translate from "./interceptors/translate.ts";
import generateCode from "./interceptors/generateCode.ts";

export const functionCallInterceptors = [math, time, translate, generateCode];
