import fs from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = './FINAL PERFORMANCE TASK.pdf';

async function extract() {
  const buf = fs.readFileSync(pdfPath);
  const data = new Uint8Array(buf);
  const loadingTask = getDocument({data});
  const doc = await loadingTask.promise;
  let fullText = '';
  for (let i=1;i<=doc.numPages;i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join(' ') + '\n\n';
  }
  console.log(fullText);
}

extract().catch(err => {
  console.error('ERROR', err);
  process.exit(1);
});
