# Scrollarly

## Inspiration
Access to quality, reputable information is a necessity, yet research as it stands today is highly restricted and devalued, as political and institutional barriers limit who can engage with what topics. 
Academic research remains largely insulated, often circulating within exclusive communities. Paywalls and outdated discovery systems hinder the dissemination of knowledge.

As a senior studying Computer Science and Child policy research, who is also conducting thesis research and hopes to continue with research/academia, making access to information more equitable is extremely important to me. **Scrollarly** aims to dismantle some of the barriers to finding and engaging in research by leveraging AI and agent driven methodologies and employing a clean, user-friendly interface.

## What it does
Scrollarly is a continuous-scrolling research discovery platform that applies the engagement mechanics of social media to academic literature. By integrating InterSystems IRIS Vector Search, it enables natural language-driven discovery, personalized recommendations, and multi-vector semantic retrieval, which makes sure that users find the most relevant research without reliance on rigid keyword matching. This platform reimagines research consumption and makes it intuitive and accessible to a broader audience.

## How I built it
**Frontend:** Vite, TypeScript, React, Tailwind CSS, shadcn-ui
**Backend & Infrastructure:** Supabase, InterSystems IRIS, Elasticsearch Serverless, Node.js

**Search & NLP:** - Vector embeddings & RAG (Retrieval-Augmented Generation) pipelines
- Multivector search with hybrid retrieval, allowing for semantic + keyword-driven exploration.
- Text to speech functionality for greater accessibility. 

**Personalization & Algorithmic Ranking:** - Embedding-based user profiling for smarter recommendations.
- Context-aware retrieval models based on skill level, to improve engagement.
- Text to speech functionality for greater accessibility. 

**Data Processing:**
- Data ingestion pipeline for near real-time article updates.
- Optimized chunking and indexing for rapid query performance.

## Challenges I ran into
Initially, I wanted to use this specific dynamic API for in-depth citation relationships but faced limitations due to API deprecations. I pivoted focus more on vector embeddings and other techniques to approximate citation relevance. It also took a while design and figure out a simple UI that accomplished the goals I wanted. 

## Accomplishments that I'm proud of
I'm proud at how well the search + ranking method works, as well as the overall flow of UI. I am also proud of the up-to-date curated dataset and the agentic workflows that made this happen. 

## What I learned
It's always important to be adaptive!

## What's next for Scrollarly
More features! A explore page, comment functionalities, more AI-driven paper insights

