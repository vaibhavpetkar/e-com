async function run() {
    try {
        const res = await fetch("http://localhost:5000/api/products/1");
        console.log(res.status);
        console.log(await res.text());
    } catch (e) {
        console.error(e);
    }
}
run();
