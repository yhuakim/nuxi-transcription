import { v2 as Cloudinary } from 'cloudinary';
import { parse } from 'path'

export default defineEventHandler(async (event) => {
    const { name, path } = await readBody(event)
    const filename = parse(name).name

    try {
        Cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
            secure: true
        });

        await Cloudinary.uploader.upload(path,
            {
                resource_type: "video",
                public_id: `demo/${filename}`,
                raw_convert: "google_speech:srt:vtt"
            },
            function (error, result) {
                if (result) {
                    return result
                }
            })
        const transcribedVideo = Cloudinary.url(`demo/${filename}`, {
            resource_type: "video",
            loop: false,
            controls: true,
            autoplay: true,
            fallback_content: "Your browser does not support HTML5 video tags",
            transformation: [
                {
                    overlay: {
                        resource_type: "subtitles",
                        public_id: `demo/${filename}.en-US.srt`
                    }
                },
                { flags: "layer_apply" }
            ]
        })
        return {
            statusCode: 200,
            data: JSON.stringify(transcribedVideo)
        };

    } catch (error) {
        console.log(error);
    }
})