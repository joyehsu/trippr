import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Scroll to top to ensure html2canvas captures everything correctly without cropping
  window.scrollTo(0, 0);

  // Add a class to handle specific styling overrides for PDF (like removing sticky headers)
  element.classList.add('pdf-export-mode');

  try {
    // Wait a brief moment for styles to apply (though usually synchronous, good for safety)
    await new Promise(resolve => setTimeout(resolve, 200));

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow cross-origin images if any
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024, // Fix window width to ensure consistent layout
      scrollY: -window.scrollY, // Correct scrolling offset
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfImgWidth = pdfWidth;
    const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

    // Handle pagination if content is longer than one page
    let heightLeft = pdfImgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, pdfImgWidth, pdfImgHeight);
    heightLeft -= pdfHeight;

    // Subsequent pages
    while (heightLeft > 0) {
      // Calculate the position for the next page
      const pageIndex = Math.ceil((pdfImgHeight - heightLeft) / pdfHeight);
      const newPos = -(pdfHeight * pageIndex);
      
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, newPos, pdfImgWidth, pdfImgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${fileName}.pdf`);
  } catch (err) {
    console.error('PDF Generation failed', err);
    throw err;
  } finally {
    element.classList.remove('pdf-export-mode');
  }
};