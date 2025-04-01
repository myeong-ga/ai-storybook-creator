

## 시작하기

.env.local.example 을 .env.local 로 copy

```bash
cp .env.local.example .env.local
```

gemini-2.0-flash-exp 모델을 사용하려면  GOOGLE_GENERATIVE_AI_API_KEY 가 정의되어야 합니다.

```bash
pnpm install
pnpm dev

```

## 프로젝트 소개

gemini-2.0-flash-exp 이용 TEXT, IMAGE 질의.

web application that uses gemini-2.0-flash-exp to generate personalized alphabet storybooks for children, complete with illustrations that can be read and shared.

This application leverages Vercel Blob Storage, an S3-compatible object storage solution optimized for serverless environments, to efficiently store and serve image assets for the storybooks. The Blob Storage provides a scalable way to handle binary data without managing infrastructure, similar to how AWS S3 works but seamlessly integrated with the Vercel platform. Additionally, the application utilizes Vercel KV (Key-Value) Storage, a Redis-compatible serverless database, to store story metadata, user preferences, and application state, enabling fast data retrieval with minimal latency while maintaining a completely serverless architecture.

## Local 환경 개발
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.




This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
