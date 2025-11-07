const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Arjun", "Rohan", "Ayaan",
  "Diya", "Anaya", "Myra", "Siya"
];
const lastNames = [
  "Sharma", "Verma", "Gupta", "Reddy", "Kumar",
  "Singh", "Mehta", "Das", "Patel"
];
const cities = [
  "Mumbai", "Delhi", "Bengaluru",
  "Chennai", "Hyderabad", "Pune"
];

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function generatePeople(start, end) {
  const data = [];
  for (let i = start; i < end; i++) {
    const first =
      firstNames[
        Math.floor(seededRandom(i + 1) * firstNames.length)
      ];
    const last =
      lastNames[
        Math.floor(seededRandom(i + 77) * lastNames.length)
      ];
    const city =
      cities[
        Math.floor(seededRandom(i + 33) * cities.length)
      ];

    const age = 18 + Math.floor(seededRandom(i + 91) * 40);

    data.push({
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      age,
      city,
    });
  }
  return data;
}
