<!--
title: 'AWS Simple HTTP Endpoint example in NodeJS'
description: 'This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

### Render Gantt Image AWS Lambda function

This serverless application generates a PNG image of a Gantt chart from provided JSON task data using a headless Chromium browser via Puppeteer. It includes a custom Lambda authorizer that secures access with an API key.

### Features

- Generates high-quality Gantt chart images
- Secured with a custom Lambda authorizer using an API key
- Runs headless Chromium in AWS Lambda using @sparticuz/chromium
- Easily deployable using the Serverless Framework

### Project Structure

├── handler.js           # Main Lambda render logic
├── authorizer.js        # Custom request authorizer logic
├── ganttBuilder.js      # HTML + CSS generator for Gantt chart
├── serverless.yml       # Serverless Framework configuration
├── .env                 # Secure environment variable for API key
├── package.json         # Project dependencies

### Security

Authentication is enforced using a custom Lambda authorizer. Requests must include a valid API key in the x-api-key header.

- Header: x-api-key
- Expected value: set in .env as AUTH_TOKEN

Example request:
POST /render
Host: your-api-id.execute-api.us-east-1.amazonaws.com
Content-Type: application/json
x-api-key: your_secret_key

### Deployment

1. Install dependencies:
   npm install

2. Set your auth token in a .env file:
   AUTH_TOKEN=your_secret_api_key

3. Deploy using the Serverless Framework:
   npx serverless deploy

### Usage

Endpoint: POST /render

Request body:
{
  "tasks": [
    {
      "Component Group": "Economy Seats",
      "Aircraft": "4884",
      "MRO": "MLB",
      "Warning": "N/A",
      "Start Date": "2025-04-08T00:00:00Z",
      "End Date": "2025-05-16T00:00:00Z",
      "PercentComplete": "0.0954"
    }
  ]
}

Response: PNG image (base64-encoded in body)

### Testing

You can test the endpoint using curl:

curl --location 'https://your-api-id.execute-api.us-east-1.amazonaws.com/render' \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: your_secret_key' \
  --data '{ "tasks": [ ... ] }'

### Dependencies

- @sparticuz/chromium
- puppeteer-core
- date-fns
- serverless
- serverless-dotenv-plugin

### To-Do

- Add logging support with AWS CloudWatch Insights
- Add stage-based environment separation (dev/prod)
- Optionally support image branding or watermarking

