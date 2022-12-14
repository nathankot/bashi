import { Head } from "$fresh/runtime.ts";
import Example from "../islands/Example.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>gptassist</title>
      </Head>

      <div class="p-4 mx-auto max-w-screen-md">
        <Example />
      </div>
    </>
  );
}
