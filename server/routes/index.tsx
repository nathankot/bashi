import { Head } from "$fresh/runtime.ts";
import TextPrompt from "../islands/TextPrompt.tsx";
import AudioPrompt from "../islands/AudioPrompt.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>gptassist</title>
      </Head>

      <div class="p-4 mx-auto max-w-screen-md">
        <p class="my-6">text prompt example</p>
        <TextPrompt />
      </div>

      <div class="p-4 mx-auto max-w-screen-md">
        <p class="my-6">audio prompt example</p>
        <AudioPrompt />
      </div>
    </>
  );
}
