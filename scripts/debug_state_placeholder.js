const seats = ['A4', 'B8'];
const apiUrl = 'http://localhost:3000/api/seat-details';

async function checkState() {
    for (const id of seats) {
        const res = await fetch(`${apiUrl}?seatId=${id}`); // Assuming GET with query param?
        // Or maybe POST? Or dynamic route?
        // Let's deduce from file content.
        // If file is `app/api/seat-details/route.ts`, it handles requests.
        // Assuming GET.

        // Wait, I should better wait to see the file content first.
        // But to save turn, I'll assume GET.
        // If it fails, I'll know.
    }
}
// Actually, I'll wait to see the file content before writing the script to be correct.
