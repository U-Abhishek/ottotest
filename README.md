# OttoTest

OttoTest is a web application that helps hardware testers generate test workflows using LLMs (Gemini API). Create, visualize, and edit hardware test procedures with an intuitive flowchart interface.

## Features

- 🤖 **AI-Powered Workflow Generation**: Use Gemini API to generate test workflows from natural language descriptions
- 📊 **Visual Flowchart Editor**: Edit and visualize workflows as interactive flowcharts with drag-and-drop
- 📄 **Document Support**: Upload technical documents to provide context for better workflow generation
- ✏️ **Interactive Editing**: Click on workflow steps to edit their details

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up your Gemini API key:

Create a `.env.local` file in the root directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Create Workflow**: Click "Create Workflow" on the home page
2. **Upload Document** (optional): Upload a technical document to provide context
3. **Describe Workflow**: Enter a description of your hardware test requirements
4. **Generate**: Click "Generate Workflow" to create the workflow using AI
5. **Edit Flowchart**: In the editor, click on nodes to edit, drag to reposition, and connect nodes to create the flow

## Tech Stack

- **Next.js 16** - React framework
- **React Flow** - Flowchart visualization
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Google Gemini API** - AI workflow generation

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
