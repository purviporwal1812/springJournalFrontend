import React from 'react';

const About = ({ icon, title, children }) => (
    <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 text-teal-600 mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{children}</p>
    </div>
);

export default About;