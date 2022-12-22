import { Head } from "$fresh/runtime.ts";
import PromptDev from "../islands/PromptDev.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>gptassist</title>
      </Head>

      <div class="p-4 mx-auto max-w-screen-md">
        <PromptDev />
      </div>
    </>
  );
}
