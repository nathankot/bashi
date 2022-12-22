import { Head } from "$fresh/runtime.ts";
import PromptDev from "../islands/PromptDev.tsx";
import Examples from "../islands/Examples.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>gptassist</title>
      </Head>

      <div class="p-4 mx-auto max-w-screen-md">
        <h1>Prompt Dev</h1>
        <PromptDev />
      </div>

      <div class="p-4 mx-auto max-w-screen-md">
        <h1>Examples</h1>
        <Examples />
      </div>
    </>
  );
}
