export function buildPrintHtml(content: HTMLElement, title: string): string {
  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  )
    .map((l) => l.outerHTML)
    .join('\n');
  const styles = Array.from(document.querySelectorAll('style'))
    .map((s) => s.outerHTML)
    .join('\n');
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    ${links}
    ${styles}
    <style>* { box-sizing: border-box; } body { background: #fff; } @media print { @page { size: A4; margin: 15mm 15mm 20mm 15mm; } }</style>
  </head>
  <body>${content.innerHTML}</body>
</html>`;
}

function resolveColor(color: string): string {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return a < 255 ? `rgba(${r},${g},${b},${a / 255})` : `rgb(${r},${g},${b})`;
}

export async function downloadAsPdf(
  el: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    onclone: (_doc, clonedEl) => {
      const nodes = [clonedEl, ...Array.from(clonedEl.querySelectorAll<HTMLElement>('*'))];
      const colorProps = [
        'color', 'background-color',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline-color', 'text-decoration-color',
      ];
      nodes.forEach((node) => {
        const computed = window.getComputedStyle(node);
        colorProps.forEach((prop) => {
          const val = computed.getPropertyValue(prop);
          if (val.includes('oklch')) node.style.setProperty(prop, resolveColor(val));
        });
      });
    },
  });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgH = (canvas.height * pageW) / canvas.width;
  let y = 0;
  if (imgH <= pageH) {
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH);
  } else {
    while (y < imgH) {
      pdf.addImage(imgData, 'PNG', 0, -y, pageW, imgH);
      y += pageH;
      if (y < imgH) pdf.addPage();
    }
  }
  pdf.save(filename);
}
