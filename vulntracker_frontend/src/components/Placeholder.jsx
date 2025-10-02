import React from 'react';

const Placeholder = ({ title }) => (
    <section className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl shadow-md text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 text-lg">This section is currently under development. Please check back later!</p>
    </section>
);

export default Placeholder;