import { toPng } from 'html-to-image';

interface TicketData {
    ticketId: string;
    seatInfo: string;
    row: string;
    number: number;
    bookedAt: number;
    userName: string;
    userEmail: string;
}

export const downloadTicketAsImage = async (data: TicketData) => {
    // Create a temporary container for the ticket
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '400px';
    container.style.zIndex = '-1';
    document.body.appendChild(container);

    // Create the ticket HTML structure
    // We use inline styles heavily to ensure the snapshot looks correct
    container.innerHTML = `
        <div style="
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            padding: 32px;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.1);
            position: relative;
            overflow: hidden;
            width: 100%;
            height: auto;
        ">
            <!-- Decorative circles -->
            <div style="
                position: absolute;
                top: -20px;
                left: -20px;
                width: 100px;
                height: 100px;
                background: rgba(6, 182, 212, 0.2);
                border-radius: 50%;
                filter: blur(40px);
            "></div>
            <div style="
                position: absolute;
                bottom: -20px;
                right: -20px;
                width: 100px;
                height: 100px;
                background: rgba(147, 51, 234, 0.2);
                border-radius: 50%;
                filter: blur(40px);
            "></div>

            <!-- Header -->
            <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 24px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                padding-bottom: 20px;
            ">
                <div style="
                    background: linear-gradient(135deg, #06b6d4, #2563eb);
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 20px;
                ">
                    T
                </div>
                <div>
                    <h1 style="margin: 0; font-size: 18px; font-weight: bold;">Smart Ticket</h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Event Entry Pass</p>
                </div>
            </div>

            <!-- Main Content -->
            <div style="margin-bottom: 24px;">
                <div style="margin-bottom: 20px;">
                    <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Seat Number</p>
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #fff;">${data.seatInfo}</p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #cbd5e1;">Row ${data.row}, Seat ${data.number}</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Date</p>
                        <p style="margin: 0; font-size: 14px; color: #fff; font-weight: 500;">
                            ${new Date(data.bookedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                         <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Time</p>
                        <p style="margin: 0; font-size: 14px; color: #fff; font-weight: 500;">
                            ${new Date(data.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Footer / User Info -->
            <div style="
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
            ">
                <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Sent to</p>
                <p style="margin: 0; font-size: 14px; color: #fff; font-weight: 500;">${data.userName}</p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">${data.userEmail}</p>
            </div>

            <!-- Ticket ID -->
             <div style="text-align: center; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 16px;">
                <p style="margin: 0; font-family: monospace; font-size: 10px; color: #64748b; letter-spacing: 1px;">
                    ID: ${data.ticketId}
                </p>
            </div>
        </div>
    `;

    try {
        const dataUrl = await toPng(container, {
            quality: 1.0,
            pixelRatio: 2, // High res
        });

        // Trigger download
        const link = document.createElement('a');
        link.download = `ticket-${data.seatInfo}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Failed to generate ticket image:', err);
        alert('Failed to download ticket. Please try again.');
    } finally {
        document.body.removeChild(container);
    }
};
