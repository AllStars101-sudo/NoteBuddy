![image](https://github.com/user-attachments/assets/b7c5f86d-de3b-4194-b36c-23d0f52088ef)

# NoteBuddy: A Note-Taking App That Doesn't Suck

### Keynote [here](https://www.youtube.com/watch?v=IJSRWzBrdW0)
### Demo link [here](https://note-buddy-frostwire.vercel.app)

## Inspiration
NoteBuddy was born out of our frustration with traditional note-taking apps, which lack the contextual intelligence needed for efficient learning and productivity. As students juggling diverse courses and professionals managing complex projects, we realized note-taking could be significantly smarter. We envisioned a tool that doesn't just store information but actively participates in our thinking process, streamlining ideas, offering smart suggestions, and even transcribing conversations intelligently.

## What it does
NoteBuddy is an AI-powered note-taking platform designed to enrich the way users capture and organize knowledge:

- **Rich Text Editing:** Seamlessly write and format notes, just the way you like.
- **Predictive Typing:** Intelligent autocompletion and contextual assistance as you write using the multimodal power of GPT-4o-mini, similar to GitHub Copilot but for your notes.
- **Voice Mode:** Capture spoken ideas, transcribed and analyzed instantly and accurately using OpenAI's Whisper API. A key question that we kept asking ourselves was "How was NoteBuddy going to be useful to us as students?" So, we implemented a feature where Voice Mode would automatically detect if a lecture was being presented and prepare a set of quizzes based on that in addition to just key points, a summary, and the lecture transcript.
- **Smart Summaries:** Condense extensive notes into clear, digestible summaries.
- **Contextual File Integration:** Upload PDFs, documents, and images to enhance AI context. GPT-4o-mini will automatically take in the context that you provide with your uploaded files and analyze them to assist you with your writing.
- **File Attachments & Organization:** Conveniently manage and access files alongside notes.
- **Offline Capability:** Reliable offline support with seamless synchronization.
- **Secure Authentication:** Secure your notes and data through Auth0 integration.

## How we built it
We built NoteBuddy leveraging a modern and scalable tech stack optimized for responsiveness and AI capabilities:

- **Next.js:** Server-side rendering and efficient routing.
- **React & TypeScript:** Interactive, strongly-typed UI components.
- **TipTap:** Rich text editor with custom AI-driven extensions.
- **OpenAI API:** AI-driven text completion, summarization, and transcription.
- **Vercel Blob Storage:** Efficient and cutting-edge storage solution for notes and associated files.
- **Auth0:** Reliable authentication management.
- **Tailwind CSS, Framer Motion & Radix UI:** A responsive, interactive, and accessible user experience.

Our architecture utilizes server actions for streamlined backend operations, client-side interactivity, and robust offline synchronization with local storage. This ensures a fluid and uninterrupted note-taking experience, even offline.

A standout feature was the integration of custom TipTap extensions, which provided seamless AI-driven suggestions and improved user productivity dramatically.

## Challenges we faced
Building NoteBuddy brought multiple technical hurdles, notably:

- **AI Context Management:** Extracting meaningful context from varied file types (PDFs, images, documents) required tailored extraction strategies and intelligent storage solutions. We didn't just want the AI to know your files, we wanted it to understand them.
- **Voice Processing Pipeline:** Implementing robust audio transcription and real-time analysis involved tackling asynchronous processing complexities.
- **Offline Synchronization:** Ensuring data integrity and conflict resolution across devices in offline scenarios demanded meticulous testing and implementation.
- **Rich Editor Integration:** Seamlessly integrating TipTap with dynamic AI suggestions necessitated building custom extensions and advanced state management.
- **Performance Optimization:** Balancing multiple simultaneous AI tasks without sacrificing responsiveness pushed us to optimize every step of data processing and rendering.

A particular breakthrough was developing a streamlined pipeline for voice recording and AI-based transcription that provided immediate, accurate feedback to users.

## What we learned
This project deepened our understanding of:

- Implementing intuitive AI functionalities that enhance, rather than distract from, the note-taking experience.
- Crafting effective offline-first strategies that ensure data availability and reliability.
- Audio and voice processing directly within web browsers.
- Building scalable, maintainable, and accessible UI components.
- Managing complex React application states and optimizing performance, especially in AI-intensive tasks.
- Advanced Next.js features.

Critically, we learned the importance of user-centric design in shaping AI-driven features that genuinely help rather than overwhelm users.

## What's next for NoteBuddy
Future development directions include:

- **Collaborative Editing:** Real-time co-editing and sharing capabilities.
- **Enhanced AI Context Understanding:** Cross-note context intelligence and smarter insights.
- **Mobile Applications:** Native apps for better mobile accessibility.
- **Advanced Organization Tools:** Tags, smart folders, and AI-based categorization.
- **External Tool Integrations:** Calendar synchronization, task manager integrations, and more.
- **Expanded Export and Sharing Options:** Exporting notes to additional formats and platforms.

NoteBuddy embodies our vision for smarter note-taking—where AI actively enhances creativity, productivity, and organization. We're excited about empowering users to think better, organize effectively, and achieve more with their notes.
