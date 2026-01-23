const seats = ['A6'];
const apiUrl = 'http://localhost:3000/api/seat-details';

async function checkState() {
    console.log('Checking state for seats:', seats.join(', '));
    const url = `${apiUrl}?seatIds=${seats.join(',')}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        console.log('Response status:', res.status);
        if (res.status === 200) {
            console.log('Seats Data:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('Error:', data);
        }
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}

checkState();
