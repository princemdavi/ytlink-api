import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEYFILEPATH = path.join(__dirname, "./credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

export async function uploadFile({ stream, mimeType, name }) {
  try {
    let fileMetadata = {
      name,
      parents: ["1o8jn6azmDVZq3vJ-J8RuGlKBQqUBOdmA"],
    };

    let media = {
      mimeType,
      body: stream,
    };

    const result = await drive.files.create({
      resource: fileMetadata,
      media: media,
      supportsAllDrives: true,
      fields: "id",
    });
    return result.data.id;
  } catch (error) {
    console.log(error.message);
  }
}

export default drive;
