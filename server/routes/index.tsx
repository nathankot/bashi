import { Head } from "$fresh/runtime.ts";
import Prompt from "../islands/Prompt.tsx";
import AudioPrompt from "../islands/AudioPrompt.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>gptassist</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <p class="my-6">Blah blah blah</p>
        <Prompt />
        <AudioPrompt />
      </div>
    </>
  );
}
