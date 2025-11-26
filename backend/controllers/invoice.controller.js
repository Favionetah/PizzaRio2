const Invoice = require('../models/invoice.model');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const InvoiceController = {};

// Generar PDF de factura
InvoiceController.generatePDF = async (req, res) => {
    try {
        const { idPedido } = req.params;

        // Obtener datos de la factura
        const invoiceData = await Invoice.getByOrderId(idPedido);

        if (!invoiceData) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        // Leer la plantilla HTML
        const templatePath = path.join(__dirname, '../templates/invoice-template.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf-8');

        // Formatear fecha
        const fechaEmision = new Date(invoiceData.fechaPedido).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Generar filas de items
        let itemsHTML = '';
        if (invoiceData.items && invoiceData.items.length > 0) {
            itemsHTML = invoiceData.items.map(item => `
                <tr>
                    <td class="text-center">${item.cantidad}</td>
                    <td>${item.nombre}</td>
                    <td class="text-right">Bs ${parseFloat(item.precioUnitario).toFixed(2)}</td>
                    <td class="text-right">Bs ${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
            `).join('');
        }

        // Reemplazar placeholders
        htmlTemplate = htmlTemplate
            .replace(/{{numeroFactura}}/g, invoiceData.numeroFactura)
            .replace(/{{razonSocial}}/g, invoiceData.razonSocial || 'Cliente General')
            .replace(/{{nit}}/g, invoiceData.nit || 'S/N')
            .replace(/{{fechaEmision}}/g, fechaEmision)
            .replace(/{{metodoPago}}/g, invoiceData.metodoPago || 'Efectivo')
            .replace(/{{items}}/g, itemsHTML)
            .replace(/{{subtotal}}/g, parseFloat(invoiceData.totalPedido).toFixed(2))
            .replace(/{{descuento}}/g, parseFloat(invoiceData.descuento || 0).toFixed(2))
            .replace(/{{totalFactura}}/g, parseFloat(invoiceData.totalFactura).toFixed(2));

        // Generar PDF con Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'Legal',
            printBackground: true,
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in'
            }
        });
        await browser.close();

        // Guardar PDF en disco (carpeta invoices)
        const invoicesDir = path.join(__dirname, '../invoices');
        await fs.mkdir(invoicesDir, { recursive: true });

        const pdfPath = path.join(invoicesDir, `${invoiceData.numeroFactura}.pdf`);
        await fs.writeFile(pdfPath, pdfBuffer);

        console.log(`Factura generada: ${pdfPath}`);

        // Enviar PDF al cliente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoiceData.numeroFactura}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error al generar PDF:", error);
        res.status(500).json({ message: "Error al generar factura PDF" });
    }
};

// Obtener datos de factura (sin PDF)
InvoiceController.getInvoiceData = async (req, res) => {
    try {
        const { idPedido } = req.params;
        const invoiceData = await Invoice.getByOrderId(idPedido);

        if (!invoiceData) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        res.status(200).json(invoiceData);
    } catch (error) {
        console.error("Error al obtener factura:", error);
        res.status(500).json({ message: "Error al obtener factura" });
    }
};

module.exports = InvoiceController;
