import type { GeneratedFile } from '../core/contracts/types';

/**
 * Preview Composer.
 * Combines generated files into a single HTML document for iframe preview.
 */
export function composePreview(files: GeneratedFile[]): string {
  const htmlFile = files.find((f) => f.path === 'index.html');
  const cssFile = files.find((f) => f.path === 'styles.css');
  const jsFile = files.find((f) => f.path === 'app.js');

  if (!htmlFile) {
    return '<!DOCTYPE html><html><body><p>Error: No HTML file found in project.</p></body></html>';
  }

  let html = htmlFile.content;

  // Inject CSS inline (replace the link tag or add to head)
  if (cssFile) {
    const cssTag = `<style>/* styles.css */\n${cssFile.content}\n</style>`;
    
    // Replace the external stylesheet link if present
    if (html.includes('href="styles.css"') || html.includes("href='styles.css'")) {
      html = html.replace(
        /<link[^>]*href=["']styles\.css["'][^>]*\/?>/i,
        cssTag
      );
    } else {
      // Inject before </head>
      html = html.replace('</head>', `${cssTag}\n</head>`);
    }
  }

  // Inject JS inline (replace the script src tag or add before </body>)
  if (jsFile) {
    const jsTag = `<script>/* app.js */\n${jsFile.content}\n</script>`;
    
    // Replace the external script tag if present
    if (html.includes('src="app.js"') || html.includes("src='app.js'")) {
      html = html.replace(
        /<script[^>]*src=["']app\.js["'][^>]*><\/script>/i,
        jsTag
      );
    } else {
      // Inject before </body>
      html = html.replace('</body>', `${jsTag}\n</body>`);
    }
  }

  return html;
}
