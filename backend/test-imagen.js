require('dotenv').config();

async function test() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: "A futuristic cyberpunk city",
            }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
          }
        }),
      }
    );

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Network/Fetch error:', error);
  }
}

test();
