/**
 * Utility functions for safe printing that comply with CSP
 */

/**
 * Safely writes HTML content to a print window without violating CSP
 */
export function safePrintWindow(
  htmlContent: string,
  title: string,
  onAfterPrint?: () => void
): Window | null {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return null;

  // Write HTML content safely
  printWindow.document.open('text/html', 'replace');
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.focus();
    // Use a function reference instead of string for setTimeout
    const printFunction = () => {
      printWindow.print();
      if (onAfterPrint) {
        onAfterPrint();
      }
    };
    setTimeout(printFunction, 250);
  };

  return printWindow;
}

/**
 * Escapes HTML to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

