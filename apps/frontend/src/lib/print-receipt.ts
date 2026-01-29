import { formatCurrency } from './utils';

interface ReceiptData {
  id: string;
  cart: any[];
  total: number;
  paymentType: 'CASH' | 'DEBIT';
  paidAmount?: number;
  changeAmount?: number;
  debitCardNo?: string;
}

export const printReceipt = (data: ReceiptData) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const { id, cart, total, paymentType, paidAmount, changeAmount, debitCardNo } = data;

  const receiptContent = `
    <html>
      <head>
        <title>Print Receipt - ${id}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 70mm; 
            padding: 5mm; 
            font-size: 12px; 
            color: #000;
          }
          .text-center { text-align: center; }
          .hr { border-top: 1px dashed #000; margin: 8px 0; }
          .flex { display: flex; justify-content: space-between; margin: 2px 0; }
          .bold { font-weight: bold; }
          .title { font-size: 16px; font-weight: bold; margin: 0; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <p class="title">MALE POS</p>
          <p style="margin: 2px 0;">Jakarta, Indonesia</p>
        </div>
        
        <div class="hr"></div>
        <div class="flex"><span>ID:</span> <span>#${id.slice(-8).toUpperCase()}</span></div>
        <div class="flex"><span>Waktu:</span> <span>${new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span></div>
        <div class="hr"></div>
        
        ${cart.map(item => `
          <div class="flex">
            <span style="flex: 1;">${item.name}</span>
            <span style="width: 30px; text-align: right;">${item.quantity}x</span>
            <span style="width: 80px; text-align: right;">${formatCurrency(item.price * item.quantity)}</span>
          </div>
        `).join('')}
        
        <div class="hr"></div>
        <div class="flex bold">
          <span>TOTAL</span>
          <span>${formatCurrency(total)}</span>
        </div>
        
        <div class="flex">
          <span>Metode</span>
          <span>${paymentType} ${paymentType === 'DEBIT' ? `(****${debitCardNo})` : ''}</span>
        </div>

        ${paymentType === 'CASH' ? `
          <div class="flex">
            <span>Bayar</span>
            <span>${formatCurrency(paidAmount || 0)}</span>
          </div>
          <div class="flex">
            <span>Kembali</span>
            <span>${formatCurrency(changeAmount || 0)}</span>
          </div>
        ` : ''}

        <div class="hr"></div>
        <div class="text-center" style="margin-top: 15px;">
          <p>Terima Kasih Atas</p>
          <p>Kunjungan Anda</p>
        </div>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(receiptContent);
  printWindow.document.close();
};