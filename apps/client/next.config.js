/** @type {import('next').NextConfig} */

// https://nextjs.org/docs/app/building-your-application/optimizing/memory-usage#analyze-a-snapshot-of-the-heap
const dotenv= require('dotenv');

dotenv.config({ path: '../../env.d/development/.env_ui' });

const nextConfig = {}

module.exports = nextConfig
