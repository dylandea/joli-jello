/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
        extend: {
            fontFamily: {
                "delicious": ['"Delicious Handrawn"', "cursive"]
            }
        }
    },
    plugins: [require('@tailwindcss/forms'), require("daisyui")]
    
};
