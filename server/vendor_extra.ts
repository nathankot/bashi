// These dependencies are loaded by client-side code, and `deno vendor` is
// unable to pick them up.
import "preact/jsx-runtime";
import "preact/hooks";
import "$fresh/src/runtime/main_dev.ts";
import "$fresh/plugins/twind/main.ts";
