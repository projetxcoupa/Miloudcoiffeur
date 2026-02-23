import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listModels() {
    try {
        const configPath = path.join(__dirname, 'kimi.config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);

        const kimiProvider = config.providers.find(p => p.name === 'Kimi');
        const apiKey = kimiProvider.apiKey.replace('${Bearer ', '').replace('}', '').trim();

        // Construct the models endpoint
        // Assuming standard OpenAI-compatible /v1/models endpoint
        const baseUrl = kimiProvider.baseURL.replace('/chat/completions', '');
        const modelsUrl = `${baseUrl}/models`;

        console.log(`Fetching models from: ${modelsUrl}`);

        const response = await fetch(modelsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Failed to list models: ${response.status} ${response.statusText} - ${errorData}`);
        }

        const data = await response.json();
        console.log('Available Models:');
        if (data.data && Array.isArray(data.data)) {
            data.data.forEach(model => {
                console.log(`- ${model.id}`);
            });
        } else {
            console.log('Unexpected response format:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
