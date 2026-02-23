import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runKimiParam() {
    try {
        const configPath = path.join(__dirname, 'kimi.config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);

        const kimiProvider = config.providers.find(p => p.name === 'Kimi');

        if (!kimiProvider) {
            console.error('Error: Kimi provider not found in kimi.config.json');
            return;
        }

        console.log('--- Kimi Configuration Loaded ---');
        console.log(`Provider: ${kimiProvider.name}`);
        console.log(`Base URL: ${kimiProvider.baseURL}`);
        console.log(`Available Models: ${kimiProvider.models.map(m => m.id).join(', ')}`);
        console.log('---------------------------------');

        // Example: Use the first available model
        const model = kimiProvider.models[0];
        const apiKey = kimiProvider.apiKey.replace('${Bearer ', '').replace('}', '').trim();

        console.log(`Testing connection with model: ${model.id}...`);

        const response = await fetch(kimiProvider.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model.id,
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: "Hello, Kimi!" }
                ],
                temperature: model.temperature,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API Request failed: ${response.status} ${response.statusText} - ${errorData}`);
        }

        const data = await response.json();
        // Log the message content
        console.log(data.choices[0].message.content);

    } catch (error) {
        console.error('Failed to run Kimi agent:', error);
    }
}

runKimiParam();
