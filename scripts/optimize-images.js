const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  { input: 'public/icon.png', output: 'public/icon-optimized.webp', resize: null },
  { input: 'public/farfish-logo.png', output: 'public/farfish-logo-optimized.webp', resize: null },
  { input: 'public/s1.png', output: 'public/s1-optimized.webp', resize: 800 },
  { input: 'public/s2.png', output: 'public/s2-optimized.webp', resize: 800 },
  { input: 'public/s3.png', output: 'public/s3-optimized.webp', resize: 800 },
  { input: 'public/frame-image.png', output: 'public/frame-image-optimized.webp', resize: 800 },
  { input: 'public/pfp.png', output: 'public/pfp-optimized.webp', resize: 200 },
  { input: 'public/og-image.png', output: 'public/og-image-optimized.webp', resize: 1200 },
];

async function optimizeImages() {
  console.log('Starting image optimization...\n');
  
  for (const img of images) {
    try {
      if (!fs.existsSync(img.input)) {
        console.log(`⚠️  Skipping ${img.input} - file not found`);
        continue;
      }

      const inputStats = fs.statSync(img.input);
      const inputSizeKB = (inputStats.size / 1024).toFixed(2);

      let pipeline = sharp(img.input);
      
      if (img.resize) {
        pipeline = pipeline.resize(img.resize, null, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      await pipeline
        .webp({ quality: 85 })
        .toFile(img.output);

      const outputStats = fs.statSync(img.output);
      const outputSizeKB = (outputStats.size / 1024).toFixed(2);
      const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

      console.log(`✅ ${path.basename(img.input)}`);
      console.log(`   ${inputSizeKB} KB → ${outputSizeKB} KB (${savings}% smaller)\n`);
    } catch (error) {
      console.error(`❌ Error processing ${img.input}:`, error.message);
    }
  }
  
  console.log('Image optimization complete!');
}

optimizeImages().catch(console.error);
