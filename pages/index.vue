<script setup>
import { saveAs } from "file-saver";

const selected = useState("selected", () => null);
const videoUrl = useState("videoUrl", () => "");
const fileName = useState("filename", () => "");
const downloaded = useState("downloaded", () => false);

const handleChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    const i = e.target.files[0];

    let reader = new FileReader();
    reader.onload = () => {
      let base64String = reader.result;
      selected.value = base64String;
      fileName.value = i.name;
    };
    reader.readAsDataURL(i);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const body = JSON.stringify({
      name: fileName.value,
      path: selected.value,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const { data } = await useFetch(`/api/transcribe`, {
      method: "POST",
      headers: config.headers,
      body,
    });
    videoUrl.value = JSON.parse(data.value.data);
  } catch (error) {
    console.error(error);
  }
};

const handleDownload = () => {
  if (videoUrl.value !== "") {
    saveAs(videoUrl.value, "transcribed video");
    downloaded.value = true;
  }
};
</script>

<template>
  <div class="max-w-[60rem] grid justify-center items-center mx-auto py-4">
    <header class="text-4xl font-bold text-gray-700 text-center">
      <h1>Video Transcription App</h1>
    </header>
    <main class="py-5">
      <section class="py-5 flex">
        <form @submit="handleSubmit">
          <div class="upload">
            <label
              for="video-file"
              class="block mb-2 text-sm font-medium text-gray-500"
              >Upload a Video file</label
            >
            <input
              type="file"
              @change="handleChange"
              name="video-file"
              id="video-file"
              class="g-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <button
            v-if="selected !== null"
            type="submit"
            class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-5 mt-2"
          >
            Upload
          </button>
        </form>
        <div v-if="selected !== null && selected !== ''" class="file-preview">
          <!-- Preview selected file here -->
          <div class="w-56 p-2">
            <video class="w-56" controls :src="selected"></video>
          </div>
        </div>
      </section>

      <section class="transcribed-preview">
        <!-- preview Transcribed video here -->
        <div v-if="videoUrl === ''" class="">
          Your transcribed video will appear here
        </div>

        <div v-else class="max-w-[35rem] shadow-2xl">
          <video autoplay controls className="mb-5 w-100">
            <source
              :src="videoUrl ? `${videoUrl}.webm` : ''"
              type="video/webm"
            />
            <source :src="videoUrl ? `${videoUrl}.mp4` : ''" type="video/mp4" />
            <source :src="videoUrl ? `${videoUrl}.ogv` : ''" type="video/ogg" />
          </video>
        </div>

        <button
          v-if="videoUrl !== ''"
          @click="handleDownload"
          class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
          :disabled="downloaded ? true : false"
        >
          Download Video
        </button>
      </section>
    </main>
  </div>
</template>
