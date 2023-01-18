import math from "./interceptors/math.ts";
import time from "./interceptors/time.ts";
import translate from "./interceptors/translate.ts";
import generateCode from "./interceptors/generateCode.ts";
import editProse from "./interceptors/editProse.ts";
import editCode from "./interceptors/editCode.ts";

export const commandInterceptors = {
  math,
  time,
  translate,
  generateCode,
  editProse,
  editCode,
};
