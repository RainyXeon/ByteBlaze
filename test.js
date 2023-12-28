const mode_array = ["none", "song", "queue"];

console.log(...mode_array.forEach(data => { return mode_array.push()`**${data}**` }))